import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { CallableContext } from 'firebase-functions/v1/https';

const db = admin.firestore();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  brand: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  originalPrice: z.number().positive(),
  salePrice: z.number().positive(),
  stock: z.number().min(0),
  specifications: z.record(z.string()),
  tags: z.array(z.string()),
  isActive: z.boolean().default(true)
});

const updateProductSchema = createProductSchema.partial();

const searchProductsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['price_low', 'price_high', 'rating', 'newest', 'popularity']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20)
});

// Create product
export const createProduct = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Check admin authentication
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    // Validate input
    const validatedData = createProductSchema.parse(data);

    // Create product document
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

    // Update category count
    await updateCategoryProductCount(validatedData.category, 1);

    return {
      success: true,
      productId: productRef.id,
      message: 'Product created successfully'
    };

  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to create product');
  }
});

// Update product
export const updateProduct = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Check admin authentication
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { productId, ...updates } = data;
    
    if (!productId) {
      throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
    }

    // Validate input
    const validatedUpdates = updateProductSchema.parse(updates);

    // Get existing product
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    const existingProduct = productSnap.data();

    // Update product
    const updatedProduct: any = {
      ...validatedUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Update slug if name changed
    if (validatedUpdates.name && validatedUpdates.name !== existingProduct?.name) {
      updatedProduct.slug = generateSlug(validatedUpdates.name);
    }

    await productRef.update(updatedProduct);

    // Update category count if category changed
    if (validatedUpdates.category && validatedUpdates.category !== existingProduct?.category) {
      await updateCategoryProductCount(existingProduct?.category, -1);
      await updateCategoryProductCount(validatedUpdates.category, 1);
    }

    return {
      success: true,
      message: 'Product updated successfully'
    };

  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to update product');
  }
});

// Delete product
export const deleteProduct = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Check admin authentication
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { productId } = data;
    
    if (!productId) {
      throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
    }

    // Get product details before deletion
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    const product = productSnap.data();

    // Delete product
    await productRef.delete();

    // Update category count
    if (product?.category) {
      await updateCategoryProductCount(product.category, -1);
    }

    // Remove from all wishlists
    const wishlistsQuery = db.collection('wishlists').where('productIds', 'array-contains', productId);
    const wishlistsSnap = await wishlistsQuery.get();
    
    const batch = db.batch();
    wishlistsSnap.docs.forEach(doc => {
      const wishlist = doc.data();
      const updatedProductIds = wishlist.productIds.filter((id: string) => id !== productId);
      batch.update(doc.ref, { productIds: updatedProductIds });
    });
    await batch.commit();

    return {
      success: true,
      message: 'Product deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting product:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete product');
  }
});

// Search products
export const searchProducts = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Validate input
    const validatedData = searchProductsSchema.parse(data);
    const { query, category, subcategory, brand, minPrice, maxPrice, inStock, sortBy, page, limit } = validatedData;

    let productsQuery: admin.firestore.Query = db.collection('products');

    // Apply filters
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

    // Apply sorting
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

    // Get products
    const snapshot = await productsQuery.get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    // Apply client-side filters (for complex queries not supported by Firestore)
    if (query) {
      const searchTerm = query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      products = products.filter(product => {
        const price = product.salePrice;
        return (minPrice === undefined || price >= minPrice) &&
               (maxPrice === undefined || price <= maxPrice);
      });
    }

    // Apply pagination
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

  } catch (error) {
    console.error('Error searching products:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to search products');
  }
});

// Get product recommendations
export const getProductRecommendations = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { productId, userId, type = 'similar', limit = 8 } = data;

    if (!productId) {
      throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
    }

    // Get the current product
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    const currentProduct = productSnap.data();
    let recommendations: any[] = [];

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
        } else {
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

  } catch (error) {
    console.error('Error getting product recommendations:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get recommendations');
  }
});

// Bulk update products
export const bulkUpdateProducts = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Check admin authentication
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { productIds, updates } = data;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Product IDs array is required');
    }

    // Validate updates
    const validatedUpdates = updateProductSchema.parse(updates);

    // Create batch
    const batch = db.batch();
    
    productIds.forEach((productId: string) => {
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

  } catch (error) {
    console.error('Error bulk updating products:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to bulk update products');
  }
});

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function updateCategoryProductCount(categoryName: string, increment: number): Promise<void> {
  try {
    const categoryRef = db.collection('categories').doc(categoryName);
    await categoryRef.update({
      productCount: admin.firestore.FieldValue.increment(increment)
    });
  } catch (error: any) {
    // If category doesn't exist, create it
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

async function getSimilarProducts(currentProduct: any, limit: number): Promise<any[]> {
  const productsRef = db.collection('products');
  const query = productsRef
    .where('category', '==', currentProduct.category)
    .where('isActive', '==', true)
    .limit(limit + 1); // +1 to exclude current product

  const snapshot = await query.get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(product => product.id !== currentProduct.id)
    .slice(0, limit);
}

async function getRelatedProducts(currentProduct: any, limit: number): Promise<any[]> {
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

async function getTrendingProducts(limit: number): Promise<any[]> {
  const productsRef = db.collection('products');
  const query = productsRef
    .where('isActive', '==', true)
    .orderBy('ratings.average', 'desc')
    .limit(limit);

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPersonalizedRecommendations(userId: string, limit: number): Promise<any[]> {
  // For now, return trending products
  // In a real implementation, you would analyze user behavior, purchase history, etc.
  return await getTrendingProducts(limit);
}

// Update product inventory
export const updateInventory = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Check admin authentication
    if (!context.auth?.token?.admin) {
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

    const currentStock = productSnap.data()?.stock || 0;
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

  } catch (error) {
    console.error('Error updating inventory:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update inventory');
  }
});
