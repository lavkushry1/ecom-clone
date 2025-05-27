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
exports.getNotificationHistory = exports.sendOrderStatusUpdate = exports.sendOrderConfirmation = exports.sendBulkNotification = exports.sendNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
const sendNotificationSchema = zod_1.z.object({
    type: zod_1.z.enum(['email', 'sms', 'push']),
    recipient: zod_1.z.string(),
    subject: zod_1.z.string().optional(),
    message: zod_1.z.string(),
    templateId: zod_1.z.string().optional(),
    data: zod_1.z.any().optional()
});
const bulkNotificationSchema = zod_1.z.object({
    type: zod_1.z.enum(['email', 'sms', 'push']),
    recipients: zod_1.z.array(zod_1.z.string()),
    subject: zod_1.z.string().optional(),
    message: zod_1.z.string(),
    templateId: zod_1.z.string().optional(),
    data: zod_1.z.any().optional()
});
exports.sendNotification = functions.https.onCall(async (data, context) => {
    try {
        const validatedData = sendNotificationSchema.parse(data);
        const { type, recipient, subject, message, templateId, data: notificationData } = validatedData;
        console.log(`Sending ${type} notification to ${recipient}`);
        const notificationRef = await db.collection('notifications').add({
            type,
            recipient,
            subject,
            message,
            templateId,
            data: notificationData,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        let result;
        switch (type) {
            case 'email':
                result = await sendEmailNotification(recipient, subject || '', message, templateId, notificationData);
                break;
            case 'sms':
                result = await sendSMSNotification(recipient, message, notificationData);
                break;
            case 'push':
                result = await sendPushNotification(recipient, subject || '', message, notificationData);
                break;
            default:
                throw new Error('Invalid notification type');
        }
        await notificationRef.update({
            status: result.success ? 'sent' : 'failed',
            sentAt: result.success ? admin.firestore.FieldValue.serverTimestamp() : null,
            error: result.error || null
        });
        return {
            success: result.success,
            notificationId: notificationRef.id,
            message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
            error: result.error
        };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
exports.sendBulkNotification = functions.https.onCall(async (data, context) => {
    try {
        const validatedData = bulkNotificationSchema.parse(data);
        const { type, recipients, subject, message, templateId, data: notificationData } = validatedData;
        console.log(`Sending bulk ${type} notifications to ${recipients.length} recipients`);
        const results = [];
        const batch = db.batch();
        for (const recipient of recipients) {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                type,
                recipient,
                subject,
                message,
                templateId,
                data: notificationData,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            let result;
            try {
                switch (type) {
                    case 'email':
                        result = await sendEmailNotification(recipient, subject || '', message, templateId, notificationData);
                        break;
                    case 'sms':
                        result = await sendSMSNotification(recipient, message, notificationData);
                        break;
                    case 'push':
                        result = await sendPushNotification(recipient, subject || '', message, notificationData);
                        break;
                    default:
                        result = { success: false, error: 'Invalid notification type' };
                }
            }
            catch (error) {
                result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
            results.push({
                recipient,
                success: result.success,
                error: result.error
            });
            batch.update(notificationRef, {
                status: result.success ? 'sent' : 'failed',
                sentAt: result.success ? admin.firestore.FieldValue.serverTimestamp() : null,
                error: result.error || null
            });
        }
        await batch.commit();
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        return {
            success: true,
            totalSent: successCount,
            totalFailed: failureCount,
            results
        };
    }
    catch (error) {
        console.error('Error sending bulk notifications:', error);
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        throw new functions.https.HttpsError('internal', 'Failed to send bulk notifications');
    }
});
async function sendEmailNotification(email, subject, message, templateId, data) {
    try {
        console.log(`Simulating email to ${email}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        const success = Math.random() > 0.05;
        if (!success) {
            return { success: false, error: 'Email delivery failed' };
        }
        await db.collection('email_logs').add({
            to: email,
            subject,
            message,
            templateId,
            data,
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Email service error' };
    }
}
async function sendSMSNotification(phone, message, data) {
    try {
        console.log(`Simulating SMS to ${phone}:`);
        console.log(`Message: ${message}`);
        const success = Math.random() > 0.1;
        if (!success) {
            return { success: false, error: 'SMS delivery failed' };
        }
        await db.collection('sms_logs').add({
            to: phone,
            message,
            data,
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error: 'SMS service error' };
    }
}
async function sendPushNotification(userId, title, message, data) {
    try {
        console.log(`Simulating push notification to user ${userId}:`);
        console.log(`Title: ${title}`);
        console.log(`Message: ${message}`);
        const success = Math.random() > 0.15;
        if (!success) {
            return { success: false, error: 'Push notification delivery failed' };
        }
        await db.collection('push_logs').add({
            userId,
            title,
            message,
            data,
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error: 'Push notification service error' };
    }
}
exports.sendOrderConfirmation = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
    var _a;
    try {
        const order = snap.data();
        const orderId = context.params.orderId;
        if (!((_a = order.customerInfo) === null || _a === void 0 ? void 0 : _a.email)) {
            console.log('No customer email found for order:', orderId);
            return;
        }
        const emailSubject = `Order Confirmation - ${order.orderNumber}`;
        const emailMessage = `
        Dear ${order.customerInfo.name},
        
        Thank you for your order! Your order ${order.orderNumber} has been confirmed.
        
        Order Details:
        - Order ID: ${orderId}
        - Total Amount: ₹${order.total}
        - Items: ${order.items.length} item(s)
        
        We'll send you updates as your order progresses.
        
        Thank you for shopping with us!
      `;
        await sendEmailNotification(order.customerInfo.email, emailSubject, emailMessage, 'order_confirmation', { order, orderId });
        if (order.customerInfo.phone) {
            const smsMessage = `Order ${order.orderNumber} confirmed! Total: ₹${order.total}. Track at: https://yourstore.com/orders/${orderId}`;
            await sendSMSNotification(order.customerInfo.phone, smsMessage, { orderId });
        }
    }
    catch (error) {
        console.error('Error sending order confirmation:', error);
    }
});
exports.sendOrderStatusUpdate = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    var _a;
    try {
        const before = change.before.data();
        const after = change.after.data();
        const orderId = context.params.orderId;
        if (before.orderStatus === after.orderStatus) {
            return;
        }
        if (!((_a = after.customerInfo) === null || _a === void 0 ? void 0 : _a.email)) {
            console.log('No customer email found for order:', orderId);
            return;
        }
        let emailSubject = '';
        let emailMessage = '';
        let smsMessage = '';
        switch (after.orderStatus) {
            case 'confirmed':
                emailSubject = `Order Confirmed - ${after.orderNumber}`;
                emailMessage = `Your order ${after.orderNumber} has been confirmed and is being prepared for shipment.`;
                smsMessage = `Order ${after.orderNumber} confirmed! Preparing for shipment.`;
                break;
            case 'shipped':
                emailSubject = `Order Shipped - ${after.orderNumber}`;
                emailMessage = `Great news! Your order ${after.orderNumber} has been shipped and is on its way to you.`;
                smsMessage = `Order ${after.orderNumber} shipped! Track your package.`;
                break;
            case 'delivered':
                emailSubject = `Order Delivered - ${after.orderNumber}`;
                emailMessage = `Your order ${after.orderNumber} has been delivered successfully. We hope you love your purchase!`;
                smsMessage = `Order ${after.orderNumber} delivered! Thank you for shopping with us.`;
                break;
            case 'cancelled':
                emailSubject = `Order Cancelled - ${after.orderNumber}`;
                emailMessage = `Your order ${after.orderNumber} has been cancelled. If you didn't request this cancellation, please contact support.`;
                smsMessage = `Order ${after.orderNumber} cancelled. Contact support if you need assistance.`;
                break;
            default:
                return;
        }
        await sendEmailNotification(after.customerInfo.email, emailSubject, emailMessage, 'order_status_update', { order: after, orderId, statusChange: { from: before.orderStatus, to: after.orderStatus } });
        if (after.customerInfo.phone) {
            await sendSMSNotification(after.customerInfo.phone, smsMessage, { orderId });
        }
    }
    catch (error) {
        console.error('Error sending order status update:', error);
    }
});
exports.getNotificationHistory = functions.https.onCall(async (data, context) => {
    try {
        const { userId, type, limit = 50 } = data;
        let query = db.collection('notifications')
            .orderBy('createdAt', 'desc')
            .limit(limit);
        if (userId) {
            query = query.where('recipient', '==', userId);
        }
        if (type) {
            query = query.where('type', '==', type);
        }
        const snapshot = await query.get();
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return { success: true, notifications };
    }
    catch (error) {
        console.error('Error getting notification history:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get notification history');
    }
});
//# sourceMappingURL=notifications.js.map