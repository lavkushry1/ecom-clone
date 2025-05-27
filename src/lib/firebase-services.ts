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
import type { Product, Order } from '@/types';

// Helper function to transform Firebase data to Product type
const transformProductData = (doc: any): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    category: data.category || '',
    subcategory: data.subcategory || '',
    brand: data.brand || '',
    images: data.images || [],
    originalPrice: data.price || data.originalPrice || 0,
    salePrice: data.salePrice || data.price || 0,
    stock: data.stock || 0,
    specifications: data.specifications || {},
    ratings: {
      average: data.rating || data.ratings?.average || 0,
      count: data.reviews || data.ratings?.count || 0
    },
    tags: data.tags || [],
    features: data.features,
    isActive: data.isActive !== false,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || new Date().toISOString(),
  };
};

// Helper function to transform Firebase data to Order type
const transformOrderData = (doc: any): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    orderNumber: data.orderNumber || '',
    userId: data.userId,
    customerInfo: data.customerInfo || { name: '', email: '', phone: '' },
    items: data.items || [],
    shippingAddress: data.shippingAddress || {},
    billingAddress: data.billingAddress || {},
    paymentMethod: data.paymentMethod || { type: 'cod', details: {} },
    paymentStatus: data.paymentStatus || 'pending',
    orderStatus: data.orderStatus || 'pending',
    subtotal: data.subtotal || 0,
    shipping: data.shipping || 0,
    tax: data.tax || 0,
    total: data.total || 0,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || new Date().toISOString(),
  };
};

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
    const products = snapshot.docs.map(doc => transformProductData(doc));

    return {
      products,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limitCount
    };
  }

  static async getProductById(id: string): Promise<Product | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, id));
    if (docSnap.exists()) {
      return transformProductData(docSnap);
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
    return snapshot.docs.map(doc => transformProductData(doc));
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
    const products = snapshot.docs.map(doc => transformProductData(doc));

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
      return transformOrderData(docSnap);
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
    return snapshot.docs.map(doc => transformOrderData(doc));
  }

  static async getAllOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => transformOrderData(doc));
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

  static async getCategoryById(id: string) {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
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
      .reduce((sum, o) => sum + o.total, 0);
    
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    };
  }
}
