import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Order, User, Category } from '@/types';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: any;
  createdAt: any;
  updatedAt: any;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  paymentSettings: {
    upiId: string;
    merchantName: string;
    taxRate: number;
    shippingRate: number;
    freeShippingThreshold: number;
  };
  uiSettings: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  };
  updatedAt: any;
}

export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    todayOrders: number;
    revenueToday: number;
    revenueTotal: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  reviews: {
    total: number;
    pending: number;
    averageRating: number;
  };
}

export class AdminService {
  private static instance: AdminService;
  private readonly ADMIN_COLLECTION = 'admin_users';
  private readonly SETTINGS_COLLECTION = 'settings';

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Admin User Management
  async createAdminUser(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const adminRef = doc(collection(db, this.ADMIN_COLLECTION));
      const admin: AdminUser = {
        id: adminRef.id,
        ...adminData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(adminRef, admin);
      return adminRef.id;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  async getAdminUser(adminId: string): Promise<AdminUser | null> {
    try {
      const adminRef = doc(db, this.ADMIN_COLLECTION, adminId);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        return { id: adminId, ...adminSnap.data() } as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting admin user:', error);
      throw new Error('Failed to get admin user');
    }
  }

  async updateAdminUser(adminId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const adminRef = doc(db, this.ADMIN_COLLECTION, adminId);
      await updateDoc(adminRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw new Error('Failed to update admin user');
    }
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const adminsRef = collection(db, this.ADMIN_COLLECTION);
      const q = query(adminsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
    } catch (error) {
      console.error('Error getting admin users:', error);
      throw new Error('Failed to get admin users');
    }
  }

  // Site Settings Management
  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const settingsRef = doc(db, this.SETTINGS_COLLECTION, 'site');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return { id: 'site', ...settingsSnap.data() } as SiteSettings;
      }
      
      // Return default settings if none exist
      return this.getDefaultSiteSettings();
    } catch (error) {
      console.error('Error getting site settings:', error);
      return this.getDefaultSiteSettings();
    }
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, this.SETTINGS_COLLECTION, 'site');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw new Error('Failed to update site settings');
    }
  }

  private getDefaultSiteSettings(): SiteSettings {
    return {
      id: 'site',
      siteName: 'Flipkart Clone',
      siteDescription: 'Complete e-commerce platform built with Next.js and Firebase',
      contactEmail: 'admin@flipkart-clone.com',
      contactPhone: '+91 9876543210',
      address: '123 Tech Street, Bangalore, India',
      socialLinks: {},
      seoSettings: {
        metaTitle: 'Flipkart Clone - Online Shopping Platform',
        metaDescription: 'Shop the latest products with fast delivery and secure payments',
        keywords: ['ecommerce', 'online shopping', 'flipkart', 'products']
      },
      paymentSettings: {
        upiId: 'merchant@paytm',
        merchantName: 'Flipkart Clone',
        taxRate: 18,
        shippingRate: 50,
        freeShippingThreshold: 500
      },
      uiSettings: {
        primaryColor: '#2874f0',
        secondaryColor: '#fb641b',
        logo: '/images/logo.png',
        favicon: '/favicon.ico'
      },
      updatedAt: serverTimestamp()
    };
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [orderStats, productStats, userStats, reviewStats] = await Promise.all([
        this.getOrderStats(),
        this.getProductStats(),
        this.getUserStats(),
        this.getReviewStats()
      ]);

      return {
        orders: orderStats,
        products: productStats,
        users: userStats,
        reviews: reviewStats
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  private async getOrderStats() {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let total = 0;
    let pending = 0;
    let completed = 0;
    let cancelled = 0;
    let todayOrders = 0;
    let revenueToday = 0;
    let revenueTotal = 0;
    
    snapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      total++;
      
      if (order.orderStatus === 'pending') pending++;
      else if (order.orderStatus === 'delivered') completed++;
      else if (order.orderStatus === 'cancelled') cancelled++;
      
      if (order.orderStatus === 'delivered') {
        revenueTotal += order.total;
      }
      
      const orderDate = new Date(order.createdAt);
      if (orderDate >= today) {
        todayOrders++;
        if (order.orderStatus === 'delivered') {
          revenueToday += order.total;
        }
      }
    });
    
    return {
      total,
      pending,
      completed,
      cancelled,
      todayOrders,
      revenueToday,
      revenueTotal
    };
  }

  private async getProductStats() {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let total = 0;
    let active = 0;
    let outOfStock = 0;
    let lowStock = 0;
    
    snapshot.docs.forEach(doc => {
      const product = doc.data() as Product;
      total++;
      
      if (product.isActive) active++;
      if (product.stock === 0) outOfStock++;
      else if (product.stock < 10) lowStock++;
    });
    
    return {
      total,
      active,
      outOfStock,
      lowStock
    };
  }

  private async getUserStats() {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let total = 0;
    let active = 0;
    let newThisMonth = 0;
    
    snapshot.docs.forEach(doc => {
      const user = doc.data();
      total++;
      
      if (user.lastActiveAt && user.lastActiveAt.toDate() >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        active++;
      }
      
      if (user.createdAt && user.createdAt.toDate() >= monthStart) {
        newThisMonth++;
      }
    });
    
    return {
      total,
      active,
      newThisMonth
    };
  }

  private async getReviewStats() {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);
    
    let total = 0;
    let pending = 0;
    let totalRating = 0;
    
    snapshot.docs.forEach(doc => {
      const review = doc.data();
      total++;
      
      if (!review.isApproved) pending++;
      totalRating += review.rating || 0;
    });
    
    return {
      total,
      pending,
      averageRating: total > 0 ? totalRating / total : 0
    };
  }

  // Bulk Operations
  async bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      productIds.forEach(productId => {
        const productRef = doc(db, 'products', productId);
        batch.update(productRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw new Error('Failed to bulk update products');
    }
  }

  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      productIds.forEach(productId => {
        const productRef = doc(db, 'products', productId);
        batch.delete(productRef);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw new Error('Failed to bulk delete products');
    }
  }

  // Activity Logs
  async logAdminActivity(adminId: string, action: string, details?: any): Promise<void> {
    try {
      const logRef = doc(collection(db, 'admin_logs'));
      await setDoc(logRef, {
        adminId,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
      // Don't throw error for logging failures
    }
  }

  async getAdminLogs(limitCount = 50): Promise<any[]> {
    try {
      const logsRef = collection(db, 'admin_logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting admin logs:', error);
      throw new Error('Failed to get admin logs');
    }
  }

  // Backup and Export
  async exportData(collections: string[]): Promise<any> {
    try {
      const exportData: any = {};
      
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        exportData[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      return {
        exportedAt: new Date().toISOString(),
        collections: exportData
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }
}

export const adminService = AdminService.getInstance();
