"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventory = exports.bulkUpdateProducts = exports.getProductRecommendations = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
const createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1).max(5000),
    category: zod_1.z.string().min(1),
    subcategory: zod_1.z.string().optional(),
    brand: zod_1.z.string().min(1),
    images: zod_1.z.array(zod_1.z.string().url()).min(1),
    originalPrice: zod_1.z.number().positive(),
    salePrice: zod_1.z.number().positive(),
    stock: zod_1.z.number().min(0),
    specifications: zod_1.z.record(zod_1.z.string()),
    tags: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean().default(true)
});
const updateProductSchema = createProductSchema.partial();
const searchProductsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    subcategory: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    minPrice: zod_1.z.number().optional(),
    maxPrice: zod_1.z.number().optional(),
    inStock: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['price_low', 'price_high', 'rating', 'newest', 'popularity']).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(50).default(20)
});
exports.createProduct = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const validatedData = createProductSchema.parse(data);
        const productRef = db.collection('products').doc();
        const product = {
            id: productRef.id,
            ...validatedData,
            slug: generateSlug(validatedData.name),
            ratings: {
                average: 0,
                count: 0
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await productRef.set(product);
        await updateCategoryProductCount(validatedData.category, 1);
        return {
            success: true,
            productId: productRef.id,
            message: 'Product created successfully'
        };
    }
    catch (error) {
        console.error('Error creating product:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to create product');
    }
});
exports.updateProduct = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { productId, ...updates } = data;
        if (!productId) {
            throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
        }
        const validatedUpdates = updateProductSchema.parse(updates);
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const existingProduct = productSnap.data();
        const updatedProduct = {
            ...validatedUpdates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (validatedUpdates.name && validatedUpdates.name !== (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.name)) {
            updatedProduct.slug = generateSlug(validatedUpdates.name);
        }
        await productRef.update(updatedProduct);
        if (validatedUpdates.category && validatedUpdates.category !== (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.category)) {
            await updateCategoryProductCount(existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.category, -1);
            await updateCategoryProductCount(validatedUpdates.category, 1);
        }
        return {
            success: true,
            message: 'Product updated successfully'
        };
    }
    catch (error) {
        console.error('Error updating product:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to update product');
    }
});
exports.deleteProduct = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { productId } = data;
        if (!productId) {
            throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
        }
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const product = productSnap.data();
        await productRef.delete();
        if (product === null || product === void 0 ? void 0 : product.category) {
            await updateCategoryProductCount(product.category, -1);
        }
        const wishlistsQuery = db.collection('wishlists').where('productIds', 'array-contains', productId);
        const wishlistsSnap = await wishlistsQuery.get();
        const batch = db.batch();
        wishlistsSnap.docs.forEach(doc => {
            const wishlist = doc.data();
            const updatedProductIds = wishlist.productIds.filter((id) => id !== productId);
            batch.update(doc.ref, { productIds: updatedProductIds });
        });
        await batch.commit();
        return {
            success: true,
            message: 'Product deleted successfully'
        };
    }
    catch (error) {
        console.error('Error deleting product:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete product');
    }
});
exports.searchProducts = functions.https.onCall(async (data, context) => {
    try {
        const validatedData = searchProductsSchema.parse(data);
        const { query, category, subcategory, brand, minPrice, maxPrice, inStock, sortBy, page, limit } = validatedData;
        let productsQuery = db.collection('products');
        productsQuery = productsQuery.where('isActive', '==', true);
        if (category) {
            productsQuery = productsQuery.where('category', '==', category);
        }
        if (subcategory) {
            productsQuery = productsQuery.where('subcategory', '==', subcategory);
        }
        if (brand) {
            productsQuery = productsQuery.where('brand', '==', brand);
        }
        if (inStock) {
            productsQuery = productsQuery.where('stock', '>', 0);
        }
        switch (sortBy) {
            case 'price_low':
                productsQuery = productsQuery.orderBy('salePrice', 'asc');
                break;
            case 'price_high':
                productsQuery = productsQuery.orderBy('salePrice', 'desc');
                break;
            case 'rating':
                productsQuery = productsQuery.orderBy('ratings.average', 'desc');
                break;
            case 'newest':
                productsQuery = productsQuery.orderBy('createdAt', 'desc');
                break;
            default:
                productsQuery = productsQuery.orderBy('createdAt', 'desc');
        }
        const snapshot = await productsQuery.get();
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (query) {
            const searchTerm = query.toLowerCase();
            products = products.filter(product => product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            products = products.filter(product => {
                const price = product.salePrice;
                return (minPrice === undefined || price >= minPrice) &&
                    (maxPrice === undefined || price <= maxPrice);
            });
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = products.slice(startIndex, endIndex);
        return {
            success: true,
            products: paginatedProducts,
            pagination: {
                page,
                limit,
                total: products.length,
                totalPages: Math.ceil(products.length / limit),
                hasMore: endIndex < products.length
            }
        };
    }
    catch (error) {
        console.error('Error searching products:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to search products');
    }
});
exports.getProductRecommendations = functions.https.onCall(async (data, context) => {
    try {
        const { productId, userId, type = 'similar', limit = 8 } = data;
        if (!productId) {
            throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
        }
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const currentProduct = productSnap.data();
        let recommendations = [];
        switch (type) {
            case 'similar':
                recommendations = await getSimilarProducts(currentProduct, limit);
                break;
            case 'related':
                recommendations = await getRelatedProducts(currentProduct, limit);
                break;
            case 'trending':
                recommendations = await getTrendingProducts(limit);
                break;
            case 'personalized':
                if (userId) {
                    recommendations = await getPersonalizedRecommendations(userId, limit);
                }
                else {
                    recommendations = await getTrendingProducts(limit);
                }
                break;
            default:
                recommendations = await getSimilarProducts(currentProduct, limit);
        }
        return {
            success: true,
            recommendations,
            type
        };
    }
    catch (error) {
        console.error('Error getting product recommendations:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get recommendations');
    }
});
exports.bulkUpdateProducts = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { productIds, updates } = data;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Product IDs array is required');
        }
        const validatedUpdates = updateProductSchema.parse(updates);
        const batch = db.batch();
        productIds.forEach((productId) => {
            const productRef = db.collection('products').doc(productId);
            batch.update(productRef, {
                ...validatedUpdates,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();
        return {
            success: true,
            message: `${productIds.length} products updated successfully`
        };
    }
    catch (error) {
        console.error('Error bulk updating products:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to bulk update products');
    }
});
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
async function updateCategoryProductCount(categoryName, increment) {
    try {
        const categoryRef = db.collection('categories').doc(categoryName);
        await categoryRef.update({
            productCount: admin.firestore.FieldValue.increment(increment)
        });
    }
    catch (error) {
        if (error.code === 'not-found') {
            const categoryRef = db.collection('categories').doc(categoryName);
            await categoryRef.set({
                name: categoryName,
                slug: generateSlug(categoryName),
                productCount: Math.max(0, increment),
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}
async function getSimilarProducts(currentProduct, limit) {
    const productsRef = db.collection('products');
    const query = productsRef
        .where('category', '==', currentProduct.category)
        .where('isActive', '==', true)
        .limit(limit + 1);
    const snapshot = await query.get();
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.id !== currentProduct.id)
        .slice(0, limit);
}
async function getRelatedProducts(currentProduct, limit) {
    const productsRef = db.collection('products');
    const query = productsRef
        .where('brand', '==', currentProduct.brand)
        .where('isActive', '==', true)
        .limit(limit + 1);
    const snapshot = await query.get();
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.id !== currentProduct.id)
        .slice(0, limit);
}
async function getTrendingProducts(limit) {
    const productsRef = db.collection('products');
    const query = productsRef
        .where('isActive', '==', true)
        .orderBy('ratings.average', 'desc')
        .limit(limit);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function getPersonalizedRecommendations(userId, limit) {
    return await getTrendingProducts(limit);
}
exports.updateInventory = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    try {
        if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { productId, stockChange } = data;
        if (!productId || stockChange === undefined) {
            throw new functions.https.HttpsError('invalid-argument', 'Product ID and stock change are required');
        }
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const currentStock = ((_c = productSnap.data()) === null || _c === void 0 ? void 0 : _c.stock) || 0;
        const newStock = Math.max(0, currentStock + stockChange);
        await productRef.update({
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            newStock,
            message: 'Inventory updated successfully'
        };
    }
    catch (error) {
        console.error('Error updating inventory:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update inventory');
    }
});
//# sourceMappingURL=products.js.map