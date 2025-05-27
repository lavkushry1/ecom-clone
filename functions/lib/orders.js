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
exports.getUserOrders = exports.getOrderById = exports.updateOrderStatus = exports.processOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
exports.processOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = snap.data();
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await snap.ref.update({
            status: 'confirmed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            trackingHistory: admin.firestore.FieldValue.arrayUnion({
                status: 'Order Confirmed',
                timestamp: new Date().toISOString(),
                description: 'Your order has been confirmed and is being prepared',
                location: 'Processing Center'
            })
        });
        for (const item of orderData.items) {
            const productRef = db.collection('products').doc(item.productId);
            await productRef.update({
                stock: admin.firestore.FieldValue.increment(-item.quantity)
            });
        }
        console.log(`Order ${orderId} processed successfully`);
        return { success: true, orderId };
    }
    catch (error) {
        console.error('Error processing order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process order');
    }
});
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        orderId: zod_1.z.string(),
        status: zod_1.z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
        trackingInfo: zod_1.z.object({
            description: zod_1.z.string(),
            location: zod_1.z.string().optional()
        }).optional()
    });
    try {
        const { orderId, status, trackingInfo } = schema.parse(data);
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }
        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (trackingInfo) {
            updateData.trackingHistory = admin.firestore.FieldValue.arrayUnion({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                timestamp: new Date().toISOString(),
                description: trackingInfo.description,
                location: trackingInfo.location || 'Processing Center'
            });
        }
        await orderRef.update(updateData);
        return { success: true, orderId, status };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided');
        }
        console.error('Error updating order status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update order status');
    }
});
exports.getOrderById = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        orderId: zod_1.z.string()
    });
    try {
        const { orderId } = schema.parse(data);
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }
        const orderData = orderDoc.data();
        if (context.auth && (orderData === null || orderData === void 0 ? void 0 : orderData.userId) !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        return {
            id: orderDoc.id,
            ...orderData
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided');
        }
        console.error('Error getting order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get order');
    }
});
exports.getUserOrders = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const schema = zod_1.z.object({
        limit: zod_1.z.number().optional().default(20),
        status: zod_1.z.string().optional()
    });
    try {
        const { limit, status } = schema.parse(data);
        let query = db.collection('orders')
            .where('userId', '==', context.auth.uid)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return { orders };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided');
        }
        console.error('Error getting user orders:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get orders');
    }
});
//# sourceMappingURL=orders.js.map