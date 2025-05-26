import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { Order, OrderStatus } from '@/types';

// Order Actions
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function getOrder(id: string) {
  try {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Order not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
}

export async function getOrdersBySessionId(sessionId: string) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching orders by session:', error);
    throw new Error('Failed to fetch orders');
  }
}

export async function getAllOrders(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw new Error('Failed to fetch orders');
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
}

export async function updateOrder(id: string, orderData: Partial<Order>) {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      ...orderData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

export async function getOrdersByStatus(status: OrderStatus) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw new Error('Failed to fetch orders by status');
  }
}

// Payment Actions
export async function processPayment(paymentData: {
  orderId: string;
  paymentMethod: 'upi' | 'card';
  amount: number;
  details?: any;
}) {
  try {
    // This would integrate with actual payment gateway
    // For now, we'll simulate payment processing
    
    const now = new Date();
    const paymentRecord = {
      ...paymentData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'payments', docRef.id), {
          status: 'completed',
          updatedAt: new Date(),
        });
        
        // Update order status
        await updateOrderStatus(paymentData.orderId, 'processing');
      } catch (error) {
        console.error('Error completing payment:', error);
      }
    }, 2000);
    
    return docRef.id;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Failed to process payment');
  }
}

export async function validateZipCode(zipCode: string): Promise<boolean> {
  try {
    // This is a demo implementation
    // In production, you would integrate with a real ZIP code validation service
    
    // For demo: ZIP codes starting with '9' are considered invalid
    return !zipCode.startsWith('9');
  } catch (error) {
    console.error('Error validating ZIP code:', error);
    throw new Error('Failed to validate ZIP code');
  }
}
