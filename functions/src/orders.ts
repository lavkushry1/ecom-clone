import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { z } from 'zod'

const db = admin.firestore()

// Order processing function - triggered when order is created
export const processOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId
    const orderData = snap.data()

    try {
      // Simulate order processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update order status to confirmed
      await snap.ref.update({
        status: 'confirmed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        trackingHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'Order Confirmed',
          timestamp: new Date().toISOString(),
          description: 'Your order has been confirmed and is being prepared',
          location: 'Processing Center'
        })
      })

      // Update inventory for each item
      for (const item of orderData.items) {
        const productRef = db.collection('products').doc(item.productId)
        await productRef.update({
          stock: admin.firestore.FieldValue.increment(-item.quantity)
        })
      }

      // Send confirmation email (would integrate with actual email service)
      console.log(`Order ${orderId} processed successfully`)
      
      return { success: true, orderId }
    } catch (error) {
      console.error('Error processing order:', error)
      throw new functions.https.HttpsError('internal', 'Failed to process order')
    }
  })

// Update order status function
export const updateOrderStatus = functions.https.onCall(async (data, context) => {
  const schema = z.object({
    orderId: z.string(),
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    trackingInfo: z.object({
      description: z.string(),
      location: z.string().optional()
    }).optional()
  })

  try {
    const { orderId, status, trackingInfo } = schema.parse(data)

    // Check if user is admin (you'd implement proper admin check)
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const orderRef = db.collection('orders').doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found')
    }

    const updateData: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    if (trackingInfo) {
      updateData.trackingHistory = admin.firestore.FieldValue.arrayUnion({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        timestamp: new Date().toISOString(),
        description: trackingInfo.description,
        location: trackingInfo.location || 'Processing Center'
      })
    }

    await orderRef.update(updateData)

    return { success: true, orderId, status }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided')
    }
    console.error('Error updating order status:', error)
    throw new functions.https.HttpsError('internal', 'Failed to update order status')
  }
})

// Get order by ID function
export const getOrderById = functions.https.onCall(async (data, context) => {
  const schema = z.object({
    orderId: z.string()
  })

  try {
    const { orderId } = schema.parse(data)
    
    const orderDoc = await db.collection('orders').doc(orderId).get()
    
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found')
    }

    const orderData = orderDoc.data()
    
    // Check if user owns this order or is admin
    if (context.auth && orderData?.userId !== context.auth.uid) {
      // Would check if user is admin here
      throw new functions.https.HttpsError('permission-denied', 'Access denied')
    }

    return {
      id: orderDoc.id,
      ...orderData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided')
    }
    console.error('Error getting order:', error)
    throw new functions.https.HttpsError('internal', 'Failed to get order')
  }
})

// Get user orders function
export const getUserOrders = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const schema = z.object({
    limit: z.number().optional().default(20),
    status: z.string().optional()
  })

  try {
    const { limit, status } = schema.parse(data)
    
    let query = db.collection('orders')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)

    if (status) {
      query = query.where('status', '==', status) as any
    }

    const snapshot = await query.get()
    const orders: any[] = []

    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return { orders }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided')
    }
    console.error('Error getting user orders:', error)
    throw new functions.https.HttpsError('internal', 'Failed to get orders')
  }
})
