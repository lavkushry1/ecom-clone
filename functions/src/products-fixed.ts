import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {z} from "zod";

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
  isActive: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

const searchProductsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum([
    "price_low",
    "price_high",
    "rating",
    "newest",
    "popularity",
  ]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Create product (Admin only)
export const createProduct = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      // Check if user is authenticated and is admin
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const isAdmin = request.auth.token?.admin === true;
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Admin access required"
        );
      }

      // Validate input data
      const validatedData = createProductSchema.parse(request.data);

      // Create product document
      const productRef = db.collection("products").doc();
      const productData = {
        ...validatedData,
        id: productRef.id,
        reviews: {
          average: 0,
          count: 0,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await productRef.set(productData);

      return {
        success: true,
        productId: productRef.id,
        message: "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create product"
      );
    }
  }
);

// Update product (Admin only)
export const updateProduct = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const isAdmin = request.auth.token?.admin === true;
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Admin access required"
        );
      }

      const {productId, ...updateData} = request.data;
      if (!productId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Product ID is required"
        );
      }

      const validatedData = updateProductSchema.parse(updateData);

      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Product not found"
        );
      }

      await productRef.update({
        ...validatedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        productId,
        message: "Product updated successfully",
      };
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update product"
      );
    }
  }
);

// Delete product (Admin only)
export const deleteProduct = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const isAdmin = request.auth.token?.admin === true;
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Admin access required"
        );
      }

      const {productId} = request.data;
      if (!productId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Product ID is required"
        );
      }

      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Product not found"
        );
      }

      await productRef.delete();

      return {
        success: true,
        productId,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete product"
      );
    }
  }
);

// Search products
export const searchProducts = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      const validatedData = searchProductsSchema.parse(request.data);
      let query = db.collection("products") as admin.firestore.Query;

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
      } else {
        query = query.orderBy("createdAt", "desc");
      }

      // Apply pagination
      const offset = (validatedData.page - 1) * validatedData.limit;
      query = query.offset(offset).limit(validatedData.limit);

      const snapshot = await query.get();
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Text search if query is provided
      let filteredProducts = products;
      if (validatedData.query) {
        const searchTerm = validatedData.query.toLowerCase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredProducts = products.filter((product: any) =>
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm)
          )
        );
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
    } catch (error) {
      console.error("Error searching products:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to search products"
      );
    }
  }
);
