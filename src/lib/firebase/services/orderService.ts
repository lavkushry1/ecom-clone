import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../config';
import { Order, OrderStatus, OrderItem, Address } from '@/types';

export class OrderService {
  private readonly ordersCollection = collection(db, 'orders');

  // Create a new order
  async createOrder(orderData: {
    items: OrderItem[];
    customerInfo: {
      email: string;
      phone: string;
      name: string;
    };
    shippingAddress: Address;
    paymentMethod: 'upi' | 'card';
    paymentDetails?: any;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }): Promise<string> {
    try {
      const order: Omit<Order, 'id'> = {
        ...orderData,
        orderNumber: this.generateOrderNumber(),
        orderStatus: 'pending' as const,
        paymentStatus: 'pending' as const,
        billingAddress: orderData.shippingAddress, // Use shipping address as billing address by default
        paymentMethod: {
          type: orderData.paymentMethod === 'upi' ? 'upi' : 'credit_card',
          details: orderData.paymentDetails || {}
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(this.ordersCollection, order);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(this.ordersCollection, orderId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data(),
        } as Order;
      }

      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(
        this.ordersCollection,
        where('orderNumber', '==', orderNumber),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as Order;
      }

      return null;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get orders by email (for guest orders)
  async getOrdersByEmail(email: string): Promise<Order[]> {
    try {
      const q = query(
        this.ordersCollection,
        where('customerInfo.email', '==', email),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const orders: Order[] = [];

      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus, statusNote?: string): Promise<void> {
    try {
      const docRef = doc(this.ordersCollection, orderId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (statusNote) {
        updateData.statusNote = statusNote;
      }

      // Add status history
      const order = await this.getOrderById(orderId);
      if (order) {
        const statusHistory = order.statusHistory || [];
        statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
          note: statusNote,
        });
        updateData.statusHistory = statusHistory;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: 'pending' | 'completed' | 'failed', transactionId?: string): Promise<void> {
    try {
      const docRef = doc(this.ordersCollection, orderId);
      const updateData: any = {
        paymentStatus,
        updatedAt: new Date(),
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (paymentStatus === 'completed') {
        updateData.paidAt = new Date();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Start order processing (10-minute simulation)
  async startOrderProcessing(orderId: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'processing', 'Order is being processed');
      
      // Simulate processing time
      setTimeout(async () => {
        try {
          await this.updateOrderStatus(orderId, 'shipped', 'Order has been shipped');
        } catch (error) {
          console.error('Error updating order to shipped:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes
    } catch (error) {
      console.error('Error starting order processing:', error);
      throw new Error('Failed to start order processing');
    }
  }

  // Admin methods
  async getAllOrders(filters?: {
    status?: OrderStatus;
    limitCount?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Order[]> {
    try {
      let q = query(this.ordersCollection, orderBy('createdAt', 'desc'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.startDate) {
        q = query(q, where('createdAt', '>=', filters.startDate));
      }

      if (filters?.endDate) {
        q = query(q, where('createdAt', '<=', filters.endDate));
      }

      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }

      const snapshot = await getDocs(q);
      const orders: Order[] = [];

      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Helper methods
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FK${timestamp.slice(-6)}${random}`;
  }

  private generateTrackingNumber(): string {
    const random = Math.random().toString(36).substring(2, 12).toUpperCase();
    return `FK${random}`;
  }

  private calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
  }
}

export const orderService = new OrderService();
