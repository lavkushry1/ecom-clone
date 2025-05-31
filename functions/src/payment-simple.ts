import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {z} from "zod";

const db = admin.firestore();

// Simple payment functions for v2
export const processPayment = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const schema = z.object({
        orderId: z.string(),
        paymentMethod: z.enum(["card", "upi", "wallet"]),
        amount: z.number().positive(),
        otp: z.string().optional(),
      });

      const {orderId, paymentMethod, amount, otp} = schema.parse(request.data);

      // Validate OTP for card payments
      if (paymentMethod === "card" && (!otp || otp.length !== 6)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Valid OTP required for card payments"
        );
      }

      // Simulate payment processing
      const processingTime = Math.random() * 3000 + 2000; // 2-5 seconds
      await new Promise((resolve) => setTimeout(resolve, processingTime));

      // Simulate payment success/failure
      const isSuccess = Math.random() > 0.05; // 95% success rate

      const paymentResult = {
        orderId,
        amount,
        paymentMethod,
        status: isSuccess ? "completed" : "failed",
        transactionId: `TXN${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: isSuccess ? null : "Payment processing failed",
      };

      // Save payment record
      await db.collection("payments").doc(orderId).set({
        ...paymentResult,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      return {
        success: isSuccess,
        ...paymentResult,
      };
    } catch (error) {
      console.error("Error processing payment:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process payment"
      );
    }
  }
);

export const verifyPayment = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const schema = z.object({
        orderId: z.string(),
        paymentMethod: z.enum(["card", "upi", "wallet"]),
      });

      const {orderId, paymentMethod} = schema.parse(request.data);

      const paymentDoc = await db.collection("payments").doc(orderId).get();

      if (!paymentDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Payment record not found"
        );
      }

      // Simulate payment verification
      const isVerified = Math.random() > 0.1; // 90% success rate
      const newStatus = isVerified ? "completed" : "failed";

      // Update payment status
      await paymentDoc.ref.update({
        status: newStatus,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentMethod,
      });

      return {
        success: isVerified,
        orderId,
        status: newStatus,
        message: isVerified ?
          "Payment verified successfully" :
          "Payment verification failed",
      };
    } catch (error) {
      console.error("Error verifying payment:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to verify payment"
      );
    }
  }
);
