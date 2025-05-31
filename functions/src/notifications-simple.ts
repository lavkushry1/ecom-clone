import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {z} from "zod";

const db = admin.firestore();

// Simple notification functions for v2
export const sendNotification = functions.https.onCall(
  {cors: true},
  async (request) => {
    try {
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Auth required"
        );
      }

      const schema = z.object({
        userId: z.string(),
        title: z.string(),
        message: z.string(),
        type: z.enum(["order", "promotion", "reminder", "system"]),
      });

      const {userId, title, message, type} = schema.parse(request.data);

      const notificationData = {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const notificationRef = await db
        .collection("notifications")
        .add(notificationData);

      return {
        success: true,
        notificationId: notificationRef.id,
        message: "Notification sent successfully",
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send notification"
      );
    }
  }
);
