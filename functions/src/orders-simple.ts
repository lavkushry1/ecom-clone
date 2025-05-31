import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Simple orders functions for v2
export const createOrderProcessingTrigger = functions.firestore
  .onDocumentCreated(
    "orders/{orderId}",
    async (event) => {
      try {
        const orderData = event.data?.data();
        const orderId = event.params.orderId;

        if (!orderData) {
          console.error("No order data found");
          return;
        }

        console.log(`Processing new order: ${orderId}`);

        // Check if order data exists
        if (!event.data) {
          console.error(`No data found for order: ${orderId}`);
          return;
        }

        // Update order status to processing
        await event.data.ref.update({
          status: "processing",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create notification for user
        await db.collection("notifications").add({
          userId: orderData.userId,
          title: "Order Confirmed",
          message: `Your order #${orderId} has been confirmed ` +
          "and is being processed.",
          type: "order",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Order ${orderId} processed successfully`);
      } catch (error) {
        console.error("Error processing order:", error);
      }
    }
  );

export const getOrderDetails = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const {orderId} = request.data;
      if (!orderId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Order ID required"
        );
      }

      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      }

      const orderData = orderDoc.data();

      // Check if user owns this order or is admin
      const isOwner = orderData?.userId === request.auth.uid;
      const isAdmin = request.auth.token?.admin === true;

      if (!isOwner && !isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Access denied"
        );
      }

      return {
        success: true,
        order: {
          id: orderDoc.id,
          ...orderData,
        },
      };
    } catch (error) {
      console.error("Error getting order details:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get order details"
      );
    }
  }
);

export const getUserOrders = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const userId = request.auth.uid;
      const ordersSnapshot = await db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        orders,
      };
    } catch (error) {
      console.error("Error getting user orders:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get user orders"
      );
    }
  }
);
