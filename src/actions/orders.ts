'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { Order } from '@/types'
import { FieldValue } from 'firebase-admin/firestore'

// Define OrderStatus type to match the one in types/index.ts
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
  })),
  totalAmount: z.number().min(0),
  shippingAddress: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(5),
    country: z.string().min(1),
  }),
  paymentMethod: z.enum(['upi', 'card']),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function createOrder(formData: FormData) {
  try {
    const rawData = {
      items: JSON.parse(formData.get('items') as string),
      totalAmount: Number(formData.get('totalAmount')),
      shippingAddress: JSON.parse(formData.get('shippingAddress') as string),
      paymentMethod: formData.get('paymentMethod') as 'upi' | 'card',
      userId: formData.get('userId') as string || undefined,
      sessionId: formData.get('sessionId') as string || undefined,
      paymentStatus: 'pending',
    }

    const validatedData = orderSchema.parse(rawData)

    const orderRef = adminDb.collection('orders').doc()
    const trackingNumber = `FK${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    await orderRef.set({
      ...validatedData,
      status: 'pending' as OrderStatus,
      trackingNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      trackingHistory: [{
        status: 'Order Placed',
        timestamp: new Date(),
        description: 'Your order has been placed successfully',
        location: 'Online'
      }]
    })

    // Update product stock
    const batch = adminDb.batch()
    for (const item of validatedData.items) {
      const productRef = adminDb.collection('products').doc(item.productId)
      batch.update(productRef, {
        stock: FieldValue.increment(-item.quantity),
        updatedAt: new Date(),
      })
    }
    await batch.commit()

    revalidatePath('/admin/orders')
    revalidatePath('/orders')
    
    return { success: true, orderId: orderRef.id, trackingNumber }
  } catch (error) {
    console.error('Error creating order:', error)
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, error: 'Failed to create order' }
  }
}

export async function getOrderById(id: string) {
  try {
    const orderDoc = await adminDb.collection('orders').doc(id).get()
    
    if (!orderDoc.exists) {
      return { success: false, error: 'Order not found' }
    }
    
    const order = {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order
    
    return { success: true, order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: 'Failed to fetch order' }
  }
}

export async function getUserOrders(userId: string) {
  try {
    const snapshot = await adminDb.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()
    
    const orders: Order[] = []
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order)
    })
    
    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const orderRef = adminDb.collection('orders').doc(id)
    const orderDoc = await orderRef.get()
    
    if (!orderDoc.exists) {
      return { success: false, error: 'Order not found' }
    }

    const now = new Date()
    let statusDescription = ''
    let statusLocation = 'Processing Center'
    
    switch (status) {
      case 'pending':
        statusDescription = 'Your order is pending'
        break
      case 'confirmed':
        statusDescription = 'Your order is being processed'
        break
      case 'shipped':
        statusDescription = 'Your order has been shipped'
        statusLocation = 'Shipping Center'
        break
      case 'delivered':
        statusDescription = 'Your order has been delivered'
        statusLocation = 'Delivery Location'
        break
      case 'cancelled':
        statusDescription = 'Your order has been cancelled'
        break
      default:
        statusDescription = `Order status updated to ${status}`
    }

    await orderRef.update({
      status,
      updatedAt: now,
      trackingHistory: FieldValue.arrayUnion({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        timestamp: now,
        description: statusDescription,
        location: statusLocation
      })
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function getAllOrders(page = 1, limit = 20, filter?: { status?: OrderStatus }) {
  try {
    let query = adminDb.collection('orders').orderBy('createdAt', 'desc')
    
    if (filter?.status) {
      query = query.where('status', '==', filter.status)
    }
    
    // Pagination
    query = query.limit(limit).offset((page - 1) * limit)
    
    const snapshot = await query.get()
    const orders: Order[] = []
    
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order)
    })
    
    // Get total count (this is expensive, consider caching or other solutions in production)
    const countQuery = filter?.status
      ? adminDb.collection('orders').where('status', '==', filter.status)
      : adminDb.collection('orders')
    
    const totalSnapshot = await countQuery.count().get()
    const total = totalSnapshot.data().count
    
    return { 
      success: true, 
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      } 
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
} 