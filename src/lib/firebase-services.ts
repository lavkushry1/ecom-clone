// Firebase Services for E-commerce Operations
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  specifications: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId?: string; // Optional for guest checkout
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phoneNumber: string;
  };
  paymentMethod: 'upi' | 'credit_card';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product Services
export class ProductService {
  private static collectionName = 'products';

  static async getAllProducts(lastDoc?: QueryDocumentSnapshot<DocumentData>, limitCount = 20) {
    let q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    return {
      products,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limitCount
    };
  }

  static async getProductById(id: string): Promise<Product | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Product;
    }
    return null;
  }

  static async getProductsByCategory(category: string, limitCount = 20) {
    const q = query(
      collection(db, this.collectionName),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  }

  static async searchProducts(searchTerm: string, limitCount = 20) {
    // Note: For better search, consider using Algolia or similar service
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      orderBy('name'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    // Client-side filtering (for demo purposes)
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...product,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      isActive: false,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  static async updateStock(id: string, quantity: number): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      stock: increment(-quantity),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }
}

// Order Services
export class OrderService {
  private static collectionName = 'orders';

  static async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...order,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    // Update product stock
    const batch = writeBatch(db);
    order.items.forEach(item => {
      const productRef = doc(db, 'products', item.productId);
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: Timestamp.fromDate(now),
      });
    });
    await batch.commit();

    return docRef.id;
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
        estimatedDelivery: docSnap.data().estimatedDelivery?.toDate(),
      } as Order;
    }
    return null;
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
    })) as Order[];
  }

  static async getAllOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
    })) as Order[];
  }

  static async updateOrderStatus(
    id: string, 
    status: Order['orderStatus'], 
    trackingNumber?: string
  ): Promise<void> {
    const updates: any = {
      orderStatus: status,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
    }

    if (status === 'shipped') {
      // Add estimated delivery date (5 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
      updates.estimatedDelivery = Timestamp.fromDate(estimatedDelivery);
    }

    await updateDoc(doc(db, this.collectionName, id), updates);
  }

  static async updatePaymentStatus(id: string, status: Order['paymentStatus']): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      paymentStatus: status,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }
}

// Category Service
export class CategoryService {
  private static collectionName = 'categories';

  static async getAllCategories() {
    const snapshot = await getDocs(collection(db, this.collectionName));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}

// Analytics Service
export class AnalyticsService {
  static async getDashboardStats() {
    const [productsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders')),
    ]);

    const products = productsSnap.docs.map(doc => doc.data());
    const orders = ordersSnap.docs.map(doc => doc.data());

    const totalProducts = products.filter(p => p.isActive).length;
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const pendingOrders = orders.filter(o => o.orderStatus === 'placed').length;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    };
  }
}
