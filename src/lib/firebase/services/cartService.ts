import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';
import { CartItem, Cart } from '@/types';

export class CartService {
  private readonly cartsCollection = collection(db, 'carts');

  // Get cart by session ID
  async getCart(sessionId: string): Promise<Cart | null> {
    try {
      const docRef = doc(this.cartsCollection, sessionId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data(),
        } as Cart;
      }

      return null;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw new Error('Failed to fetch cart');
    }
  }

  // Create or update cart
  async saveCart(sessionId: string, cart: Omit<Cart, 'id'>): Promise<void> {
    try {
      const docRef = doc(this.cartsCollection, sessionId);
      await setDoc(docRef, {
        ...cart,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving cart:', error);
      throw new Error('Failed to save cart');
    }
  }

  // Add item to cart
  async addToCart(sessionId: string, item: CartItem): Promise<void> {
    try {
      const existingCart = await this.getCart(sessionId);
      
      if (existingCart) {
        const existingItemIndex = existingCart.items.findIndex(
          cartItem => cartItem.productId === item.productId
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          existingCart.items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          existingCart.items.push(item);
        }

        // Recalculate totals
        existingCart.totalItems = existingCart.items.reduce(
          (sum, cartItem) => sum + cartItem.quantity, 0
        );
        existingCart.totalAmount = existingCart.items.reduce(
          (sum, cartItem) => sum + (cartItem.product.salePrice * cartItem.quantity), 0
        );

        await this.saveCart(sessionId, existingCart);
      } else {
        // Create new cart
        const newCart: Omit<Cart, 'id'> = {
          sessionId,
          items: [item],
          totalItems: item.quantity,
          totalAmount: item.product.salePrice * item.quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.saveCart(sessionId, newCart);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  }

  // Update item quantity
  async updateItemQuantity(sessionId: string, productId: string, quantity: number): Promise<void> {
    try {
      const cart = await this.getCart(sessionId);
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          cart.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        cart.totalItems = cart.items.reduce(
          (sum, item) => sum + item.quantity, 0
        );
        cart.totalAmount = cart.items.reduce(
          (sum, item) => sum + (item.product.salePrice * item.quantity), 0
        );

        await this.saveCart(sessionId, cart);
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw new Error('Failed to update item quantity');
    }
  }

  // Remove item from cart
  async removeFromCart(sessionId: string, productId: string): Promise<void> {
    try {
      await this.updateItemQuantity(sessionId, productId, 0);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  // Clear cart
  async clearCart(sessionId: string): Promise<void> {
    try {
      const docRef = doc(this.cartsCollection, sessionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Subscribe to cart changes (real-time updates)
  subscribeToCart(sessionId: string, callback: (cart: Cart | null) => void): Unsubscribe {
    const docRef = doc(this.cartsCollection, sessionId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cart = {
          id: snapshot.id,
          ...snapshot.data(),
        } as Cart;
        callback(cart);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to cart:', error);
      callback(null);
    });
  }

  // Merge local cart with remote cart (useful for guest to user transition)
  async mergeCart(sessionId: string, localCartItems: CartItem[]): Promise<void> {
    try {
      const remoteCart = await this.getCart(sessionId);
      
      if (remoteCart && remoteCart.items.length > 0) {
        // Merge local items with remote items
        const mergedItems = [...remoteCart.items];
        
        localCartItems.forEach(localItem => {
          const existingItemIndex = mergedItems.findIndex(
            remoteItem => remoteItem.productId === localItem.productId
          );
          
          if (existingItemIndex >= 0) {
            // Combine quantities
            mergedItems[existingItemIndex].quantity += localItem.quantity;
          } else {
            // Add new item
            mergedItems.push(localItem);
          }
        });

        const updatedCart: Omit<Cart, 'id'> = {
          ...remoteCart,
          items: mergedItems,
          totalItems: mergedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: mergedItems.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0),
        };

        await this.saveCart(sessionId, updatedCart);
      } else if (localCartItems.length > 0) {
        // Create new cart with local items
        const newCart: Omit<Cart, 'id'> = {
          sessionId,
          items: localCartItems,
          totalItems: localCartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: localCartItems.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.saveCart(sessionId, newCart);
      }
    } catch (error) {
      console.error('Error merging cart:', error);
      throw new Error('Failed to merge cart');
    }
  }
}

export const cartService = new CartService();
