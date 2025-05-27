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
exports.processPayment = exports.verifyPaymentStatus = exports.generateUPIPaymentDetails = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const QRCode = __importStar(require("qrcode"));
const zod_1 = require("zod");
const db = admin.firestore();
exports.generateUPIPaymentDetails = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        orderId: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        customerName: zod_1.z.string().optional()
    });
    try {
        const { orderId, amount, customerName } = schema.parse(data);
        const settingsDoc = await db.collection('settings').doc('payment').get();
        const settings = settingsDoc.data();
        if (!settings || !settings.upiId) {
            throw new functions.https.HttpsError('failed-precondition', 'UPI ID not configured');
        }
        const upiId = settings.upiId;
        const upiString = `upi://pay?pa=${upiId}&pn=Flipkart%20Clone&am=${amount}&cu=INR&tn=Order%20${orderId}${customerName ? `%20from%20${encodeURIComponent(customerName)}` : ''}`;
        const qrCodeDataURL = await QRCode.toDataURL(upiString, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        await db.collection('payments').doc(orderId).set({
            orderId,
            amount,
            upiId,
            upiString,
            qrCode: qrCodeDataURL,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            upiId,
            upiString,
            qrCode: qrCodeDataURL,
            amount,
            orderId
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid payment data');
        }
        console.error('Error generating UPI payment details:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate payment details');
    }
});
exports.verifyPaymentStatus = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        orderId: zod_1.z.string(),
        paymentMethod: zod_1.z.enum(['upi', 'card'])
    });
    try {
        const { orderId, paymentMethod } = schema.parse(data);
        const paymentDoc = await db.collection('payments').doc(orderId).get();
        if (!paymentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Payment record not found');
        }
        const payment = paymentDoc.data();
        const isVerified = Math.random() > 0.1;
        const newStatus = isVerified ? 'completed' : 'failed';
        await paymentDoc.ref.update({
            status: newStatus,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentMethod
        });
        if (isVerified) {
            const orderRef = db.collection('orders').doc(orderId);
            await orderRef.update({
                paymentStatus: 'paid',
                status: 'processing',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                trackingHistory: admin.firestore.FieldValue.arrayUnion({
                    status: 'Payment Received',
                    timestamp: new Date().toISOString(),
                    description: 'Payment has been received and order is being processed',
                    location: 'Payment Gateway'
                })
            });
        }
        return {
            orderId,
            paymentStatus: newStatus,
            verified: isVerified,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid verification data');
        }
        console.error('Error verifying payment:', error);
        throw new functions.https.HttpsError('internal', 'Failed to verify payment');
    }
});
exports.processPayment = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        orderId: zod_1.z.string(),
        paymentMethod: zod_1.z.enum(['upi', 'card']),
        amount: zod_1.z.number().positive(),
        cardDetails: zod_1.z.object({
            cardNumber: zod_1.z.string(),
            expiryMonth: zod_1.z.string(),
            expiryYear: zod_1.z.string(),
            cvv: zod_1.z.string(),
            cardHolderName: zod_1.z.string()
        }).optional(),
        otp: zod_1.z.string().optional()
    });
    try {
        const { orderId, paymentMethod, amount, cardDetails, otp } = schema.parse(data);
        if (paymentMethod === 'card' && (!otp || otp.length !== 6)) {
            throw new functions.https.HttpsError('invalid-argument', 'Valid OTP required for card payments');
        }
        const processingTime = Math.random() * 3000 + 2000;
        await new Promise(resolve => setTimeout(resolve, processingTime));
        const isSuccess = Math.random() > 0.05;
        const paymentResult = {
            orderId,
            paymentMethod,
            amount,
            status: isSuccess ? 'completed' : 'failed',
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            error: isSuccess ? null : 'Payment processing failed'
        };
        await db.collection('payments').doc(orderId).set({
            ...paymentResult,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        if (isSuccess) {
            await db.collection('orders').doc(orderId).update({
                paymentStatus: 'paid',
                status: 'processing',
                transactionId: paymentResult.transactionId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                trackingHistory: admin.firestore.FieldValue.arrayUnion({
                    status: 'Payment Processed',
                    timestamp: new Date().toISOString(),
                    description: 'Payment has been successfully processed',
                    location: 'Payment Gateway'
                })
            });
        }
        return paymentResult;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid payment data');
        }
        console.error('Error processing payment:', error);
        throw new functions.https.HttpsError('internal', 'Payment processing failed');
    }
});
//# sourceMappingURL=payment.js.map