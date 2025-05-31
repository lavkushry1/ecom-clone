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
exports.getUserOrders = exports.getOrderDetails = exports.createOrderProcessingTrigger = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Simple orders functions for v2
exports.createOrderProcessingTrigger = functions.firestore.onDocumentCreated("orders/{orderId}", async (event) => {
    var _a;
    try {
        const orderData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        const orderId = event.params.orderId;
        if (!orderData) {
            console.error("No order data found");
            return;
        }
        console.log(`Processing new order: ${orderId}`);
        // Update order status to processing
        if (event.data) {
            await event.data.ref.update({
                status: "processing",
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Create notification for user
        await db.collection("notifications").add({
            userId: orderData.userId,
            title: "Order Confirmed",
            message: `Your order #${orderId} has been confirmed and is being processed.`,
            type: "order",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Order ${orderId} processed successfully`);
    }
    catch (error) {
        console.error("Error processing order:", error);
    }
});
exports.getOrderDetails = functions.https.onCall({ cors: true }, async (request) => {
    var _a;
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const { orderId } = request.data;
        if (!orderId) {
            throw new functions.https.HttpsError("invalid-argument", "Order ID required");
        }
        const orderRef = db.collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Order not found");
        }
        const orderData = orderDoc.data();
        // Check if user owns this order or is admin
        const isOwner = (orderData === null || orderData === void 0 ? void 0 : orderData.userId) === request.auth.uid;
        const isAdmin = ((_a = request.auth.token) === null || _a === void 0 ? void 0 : _a.admin) === true;
        if (!isOwner && !isAdmin) {
            throw new functions.https.HttpsError("permission-denied", "Access denied");
        }
        return {
            success: true,
            order: Object.assign({ id: orderDoc.id }, orderData),
        };
    }
    catch (error) {
        console.error("Error getting order details:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to get order details");
    }
});
exports.getUserOrders = functions.https.onCall({ cors: true }, async (request) => {
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const userId = request.auth.uid;
        const ordersSnapshot = await db
            .collection("orders")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();
        const orders = ordersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            orders,
        };
    }
    catch (error) {
        console.error("Error getting user orders:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to get user orders");
    }
});
//# sourceMappingURL=orders.js.map