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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
// Validation schemas
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
    isActive: zod_1.z.boolean().default(true),
});
const updateProductSchema = createProductSchema.partial();
const searchProductsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    sortBy: zod_1.z.enum([
        "price_low",
        "price_high",
        "rating",
        "newest",
        "popularity",
    ]).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(50).default(20),
});
// Create product (Admin only)
exports.createProduct = functions.https.onCall({ cors: true }, async (request) => {
    var _a;
    try {
        // Check if user is authenticated and is admin
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const isAdmin = ((_a = request.auth.token) === null || _a === void 0 ? void 0 : _a.admin) === true;
        if (!isAdmin) {
            throw new functions.https.HttpsError("permission-denied", "Admin access required");
        }
        // Validate input data
        const validatedData = createProductSchema.parse(request.data);
        // Create product document
        const productRef = db.collection("products").doc();
        const productData = Object.assign(Object.assign({}, validatedData), { id: productRef.id, reviews: {
                average: 0,
                count: 0,
            }, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        await productRef.set(productData);
        return {
            success: true,
            productId: productRef.id,
            message: "Product created successfully",
        };
    }
    catch (error) {
        console.error("Error creating product:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to create product");
    }
});
// Update product (Admin only)
exports.updateProduct = functions.https.onCall({ cors: true }, async (request) => {
    var _a;
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const isAdmin = ((_a = request.auth.token) === null || _a === void 0 ? void 0 : _a.admin) === true;
        if (!isAdmin) {
            throw new functions.https.HttpsError("permission-denied", "Admin access required");
        }
        const _b = request.data, { productId } = _b, updateData = __rest(_b, ["productId"]);
        if (!productId) {
            throw new functions.https.HttpsError("invalid-argument", "Product ID is required");
        }
        const validatedData = updateProductSchema.parse(updateData);
        const productRef = db.collection("products").doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Product not found");
        }
        await productRef.update(Object.assign(Object.assign({}, validatedData), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        return {
            success: true,
            productId,
            message: "Product updated successfully",
        };
    }
    catch (error) {
        console.error("Error updating product:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to update product");
    }
});
// Delete product (Admin only)
exports.deleteProduct = functions.https.onCall({ cors: true }, async (request) => {
    var _a;
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const isAdmin = ((_a = request.auth.token) === null || _a === void 0 ? void 0 : _a.admin) === true;
        if (!isAdmin) {
            throw new functions.https.HttpsError("permission-denied", "Admin access required");
        }
        const { productId } = request.data;
        if (!productId) {
            throw new functions.https.HttpsError("invalid-argument", "Product ID is required");
        }
        const productRef = db.collection("products").doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Product not found");
        }
        await productRef.delete();
        return {
            success: true,
            productId,
            message: "Product deleted successfully",
        };
    }
    catch (error) {
        console.error("Error deleting product:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to delete product");
    }
});
// Search products
exports.searchProducts = functions.https.onCall({ cors: true }, async (request) => {
    try {
        const validatedData = searchProductsSchema.parse(request.data);
        let query = db.collection("products");
        // Apply filters
        if (validatedData.category) {
            query = query.where("category", "==", validatedData.category);
        }
        if (validatedData.minPrice !== undefined) {
            query = query.where("salePrice", ">=", validatedData.minPrice);
        }
        if (validatedData.maxPrice !== undefined) {
            query = query.where("salePrice", "<=", validatedData.maxPrice);
        }
        // Only show active products
        query = query.where("isActive", "==", true);
        // Apply sorting
        if (validatedData.sortBy) {
            switch (validatedData.sortBy) {
                case "price_low":
                    query = query.orderBy("salePrice", "asc");
                    break;
                case "price_high":
                    query = query.orderBy("salePrice", "desc");
                    break;
                case "rating":
                    query = query.orderBy("reviews.average", "desc");
                    break;
                case "newest":
                    query = query.orderBy("createdAt", "desc");
                    break;
                default:
                    query = query.orderBy("createdAt", "desc");
            }
        }
        else {
            query = query.orderBy("createdAt", "desc");
        }
        // Apply pagination
        const offset = (validatedData.page - 1) * validatedData.limit;
        query = query.offset(offset).limit(validatedData.limit);
        const snapshot = await query.get();
        const products = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // Text search if query is provided
        let filteredProducts = products;
        if (validatedData.query) {
            const searchTerm = validatedData.query.toLowerCase();
            filteredProducts = products.filter((product) => {
                var _a, _b, _c, _d;
                return ((_a = product.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    ((_b = product.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm)) ||
                    ((_c = product.brand) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm)) ||
                    ((_d = product.tags) === null || _d === void 0 ? void 0 : _d.some((tag) => tag.toLowerCase().includes(searchTerm)));
            });
        }
        return {
            success: true,
            products: filteredProducts,
            pagination: {
                page: validatedData.page,
                limit: validatedData.limit,
                total: filteredProducts.length,
            },
        };
    }
    catch (error) {
        console.error("Error searching products:", error);
        throw new functions.https.HttpsError("internal", "Failed to search products");
    }
});
//# sourceMappingURL=products.js.map