import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { CallableContext } from 'firebase-functions/v1/https';
import { Change, EventContext } from 'firebase-functions';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';

const db = admin.firestore();

// Validation schemas
const sendNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'push']),
  recipient: z.string(),
  subject: z.string().optional(),
  message: z.string(),
  templateId: z.string().optional(),
  data: z.any().optional()
});

const bulkNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'push']),
  recipients: z.array(z.string()),
  subject: z.string().optional(),
  message: z.string(),
  templateId: z.string().optional(),
  data: z.any().optional()
});

// Send notification to a single recipient
export const sendNotification = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = sendNotificationSchema.parse(data);
    const { type, recipient, subject, message, templateId, data: notificationData } = validatedData;

    // Log notification request
    console.log(`Sending ${type} notification to ${recipient}`);

    // Store notification in database
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

    // Send notification based on type
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

    // Update notification status
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

  } catch (error) {
    console.error('Error sending notification:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// Send bulk notifications
export const sendBulkNotification = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = bulkNotificationSchema.parse(data);
    const { type, recipients, subject, message, templateId, data: notificationData } = validatedData;

    console.log(`Sending bulk ${type} notifications to ${recipients.length} recipients`);

    const results = [];
    const batch = db.batch();

    // Process each recipient
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

      // Send notification
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
      } catch (error) {
        result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      results.push({
        recipient,
        success: result.success,
        error: result.error
      });

      // Update batch with result
      batch.update(notificationRef, {
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? admin.firestore.FieldValue.serverTimestamp() : null,
        error: result.error || null
      });
    }

    // Commit batch
    await batch.commit();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return {
      success: true,
      totalSent: successCount,
      totalFailed: failureCount,
      results
    };

  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }
    throw new functions.https.HttpsError('internal', 'Failed to send bulk notifications');
  }
});

// Email notification sender (simulated)
async function sendEmailNotification(
  email: string, 
  subject: string, 
  message: string, 
  templateId?: string, 
  data?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you would integrate with:
    // - SendGrid
    // - Amazon SES
    // - Mailgun
    // - Firebase Extensions for email
    
    console.log(`Simulating email to ${email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;
    
    if (!success) {
      return { success: false, error: 'Email delivery failed' };
    }
    
    // Store email log
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
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Email service error' };
  }
}

// SMS notification sender (simulated)
async function sendSMSNotification(
  phone: string, 
  message: string, 
  data?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you would integrate with:
    // - Twilio
    // - Amazon SNS
    // - TextLocal
    // - Firebase Extensions for SMS
    
    console.log(`Simulating SMS to ${phone}:`);
    console.log(`Message: ${message}`);
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (!success) {
      return { success: false, error: 'SMS delivery failed' };
    }
    
    // Store SMS log
    await db.collection('sms_logs').add({
      to: phone,
      message,
      data,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: 'SMS service error' };
  }
}

// Push notification sender (simulated)
async function sendPushNotification(
  userId: string, 
  title: string, 
  message: string, 
  data?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you would use Firebase Cloud Messaging (FCM)
    
    console.log(`Simulating push notification to user ${userId}:`);
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    
    // Simulate success/failure (85% success rate)
    const success = Math.random() > 0.15;
    
    if (!success) {
      return { success: false, error: 'Push notification delivery failed' };
    }
    
    // Store push notification log
    await db.collection('push_logs').add({
      userId,
      title,
      message,
      data,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Push notification service error' };
  }
}

// Order notification triggers
export const sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap: QueryDocumentSnapshot, context: EventContext) => {
    try {
      const order = snap.data();
      const orderId = context.params.orderId;
      
      if (!order.customerInfo?.email) {
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
      
      // Send confirmation email
      await sendEmailNotification(
        order.customerInfo.email,
        emailSubject,
        emailMessage,
        'order_confirmation',
        { order, orderId }
      );
      
      // Send SMS if phone number is available
      if (order.customerInfo.phone) {
        const smsMessage = `Order ${order.orderNumber} confirmed! Total: ₹${order.total}. Track at: https://yourstore.com/orders/${orderId}`;
        await sendSMSNotification(order.customerInfo.phone, smsMessage, { orderId });
      }
      
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  });

// Order status update notifications
export const sendOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>, context: EventContext) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const orderId = context.params.orderId;
      
      // Check if order status changed
      if (before.orderStatus === after.orderStatus) {
        return;
      }
      
      if (!after.customerInfo?.email) {
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
      
      // Send email notification
      await sendEmailNotification(
        after.customerInfo.email,
        emailSubject,
        emailMessage,
        'order_status_update',
        { order: after, orderId, statusChange: { from: before.orderStatus, to: after.orderStatus } }
      );
      
      // Send SMS if phone number is available
      if (after.customerInfo.phone) {
        await sendSMSNotification(after.customerInfo.phone, smsMessage, { orderId });
      }
      
    } catch (error) {
      console.error('Error sending order status update:', error);
    }
  });

// Get notification history
export const getNotificationHistory = functions.https.onCall(async (data: any, context: CallableContext) => {
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
    
  } catch (error) {
    console.error('Error getting notification history:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get notification history');
  }
});
