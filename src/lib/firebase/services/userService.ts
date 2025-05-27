import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserProfile, Address } from '@/types';

export class UserService {
  private static instance: UserService;
  private readonly COLLECTION_NAME = 'users';
  private readonly ADDRESSES_COLLECTION = 'addresses';

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Create or update user profile
  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userData = {
        ...profileData,
        id: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userId, ...userSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Add user address
  async addUserAddress(userId: string, address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const addressRef = doc(collection(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION));
      const addressData = {
        ...address,
        id: addressRef.id,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(addressRef, addressData);
      return addressRef.id;
    } catch (error) {
      console.error('Error adding user address:', error);
      throw new Error('Failed to add address');
    }
  }

  // Get user addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const addressesRef = collection(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION);
      const q = query(addressesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
    } catch (error) {
      console.error('Error getting user addresses:', error);
      throw new Error('Failed to get addresses');
    }
  }

  // Update user address
  async updateUserAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const addressRef = doc(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION, addressId);
      await updateDoc(addressRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user address:', error);
      throw new Error('Failed to update address');
    }
  }

  // Delete user address
  async deleteUserAddress(userId: string, addressId: string): Promise<void> {
    try {
      const addressRef = doc(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION, addressId);
      await deleteDoc(addressRef);
    } catch (error) {
      console.error('Error deleting user address:', error);
      throw new Error('Failed to delete address');
    }
  }

  // Set default address
  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Remove default from all addresses
      const addressesRef = collection(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION);
      const allAddresses = await getDocs(addressesRef);
      
      allAddresses.docs.forEach(doc => {
        if (doc.data().isDefault) {
          batch.update(doc.ref, { isDefault: false, updatedAt: serverTimestamp() });
        }
      });
      
      // Set new default
      const newDefaultRef = doc(db, this.COLLECTION_NAME, userId, this.ADDRESSES_COLLECTION, addressId);
      batch.update(newDefaultRef, { isDefault: true, updatedAt: serverTimestamp() });
      
      await batch.commit();
    } catch (error) {
      console.error('Error setting default address:', error);
      throw new Error('Failed to set default address');
    }
  }

  // Get user order history (integration with orders)
  async getUserOrderHistory(userId: string, limitCount = 10): Promise<any[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user order history:', error);
      throw new Error('Failed to get order history');
    }
  }

  // Get user wishlist items
  async getUserWishlist(userId: string): Promise<any[]> {
    try {
      const wishlistRef = collection(db, 'wishlists');
      const q = query(wishlistRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      throw new Error('Failed to get wishlist');
    }
  }

  // Search users (for admin)
  async searchUsers(searchTerm: string, limitCount = 20): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, this.COLLECTION_NAME);
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia for production
      const snapshot = await getDocs(query(usersRef, limit(limitCount)));
      
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      
      // Client-side filtering (not efficient for large datasets)
      return users.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get user statistics (for admin)
  async getUserStats(): Promise<{ totalUsers: number; newUsersThisMonth: number; activeUsers: number }> {
    try {
      const usersRef = collection(db, this.COLLECTION_NAME);
      const allUsers = await getDocs(usersRef);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let newUsersThisMonth = 0;
      let activeUsers = 0;
      
      allUsers.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.createdAt?.toDate() >= monthStart) {
          newUsersThisMonth++;
        }
        if (userData.lastActiveAt?.toDate() >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
          activeUsers++;
        }
      });
      
      return {
        totalUsers: allUsers.size,
        newUsersThisMonth,
        activeUsers
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Update last active timestamp
  async updateLastActive(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last active:', error);
      // Don't throw error for this as it's not critical
    }
  }
}

export const userService = UserService.getInstance();
