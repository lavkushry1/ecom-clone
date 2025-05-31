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
exports.verifyPayment = exports.processPayment = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
// Simple payment functions for v2
exports.processPayment = functions.https.onCall({ cors: true }, async (request) => {
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const schema = zod_1.z.object({
            orderId: zod_1.z.string(),
            paymentMethod: zod_1.z.enum(["card", "upi", "wallet"]),
            amount: zod_1.z.number().positive(),
            otp: zod_1.z.string().optional(),
        });
        const { orderId, paymentMethod, amount, otp } = schema.parse(request.data);
        // Validate OTP for card payments
        if (paymentMethod === "card" && (!otp || otp.length !== 6)) {
            throw new functions.https.HttpsError("invalid-argument", "Valid OTP required for card payments");
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
        await db.collection("payments").doc(orderId).set(Object.assign(Object.assign({}, paymentResult), { createdAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
        return Object.assign({ success: isSuccess }, paymentResult);
    }
    catch (error) {
        console.error("Error processing payment:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to process payment");
    }
});
exports.verifyPayment = functions.https.onCall({ cors: true }, async (request) => {
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }
        const schema = zod_1.z.object({
            orderId: zod_1.z.string(),
            paymentMethod: zod_1.z.enum(["card", "upi", "wallet"]),
        });
        const { orderId, paymentMethod } = schema.parse(request.data);
        const paymentDoc = await db.collection("payments").doc(orderId).get();
        if (!paymentDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Payment record not found");
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
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to verify payment");
    }
});
//# sourceMappingURL=payment.js.map