import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {z} from "zod";

const db = admin.firestore();

// Simple inventory functions for v2
export const updateStock = functions.https.onCall({cors: true}, async (request) => {
  try {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Auth required");
    }

    const schema = z.object({
      productId: z.string(),
      quantity: z.number(),
    });

    const {productId, quantity} = schema.parse(request.data);

    const productRef = db.collection("products").doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Product not found");
    }

    const currentStock = doc.data()?.stock || 0;
    const newStock = currentStock + quantity;

    await productRef.update({
      stock: newStock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      previousStock: currentStock,
      newStock,
      productId,
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to update stock");
  }
});

export const getInventoryReport = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth?.token?.admin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Admin required"
        );
      }

      const productsSnapshot = await db.collection("products").get();
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const summary = {
        totalProducts: products.length,
        lowStockProducts: products.filter((p: any) => p.stock < 10).length,
        outOfStockProducts: products.filter((p: any) => p.stock === 0).length,
        inStockProducts: products.filter((p: any) => p.stock > 0).length,
        totalValue: products.reduce(
          (sum: number, p: any) => sum + (p.salePrice * p.stock),
          0
        ),
      };

      return {
        success: true,
        summary,
        products: products.slice(0, 100), // Limit for performance
      };
    } catch (error) {
      console.error("Error getting inventory report:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get inventory report"
      );
    }
  }
);
