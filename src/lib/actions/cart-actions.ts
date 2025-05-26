import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { CartItem } from '@/types';

// Cart Actions
export async function getCartItems(sessionId: string) {
  try {
    const q = query(collection(db, 'cart'), where('sessionId', '==', sessionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw new Error('Failed to fetch cart items');
  }
}

export async function addToCart(sessionId: string, item: Omit<CartItem, 'id' | 'sessionId'>) {
  try {
    // Check if item already exists in cart
    const existingItems = await getCartItems(sessionId);
    const existingItem = existingItems.find(cartItem => cartItem.productId === item.productId);
    
    if (existingItem) {
      // Update quantity
      return await updateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity);
    } else {
      // Add new item
      const docRef = await addDoc(collection(db, 'cart'), {
        ...item,
        sessionId,
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Failed to add item to cart');
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }
    
    const docRef = doc(db, 'cart', itemId);
    await updateDoc(docRef, { quantity });
    return itemId;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw new Error('Failed to update cart item quantity');
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const docRef = doc(db, 'cart', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
}

export async function clearCart(sessionId: string) {
  try {
    const items = await getCartItems(sessionId);
    const deletePromises = items.map(item => removeFromCart(item.id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
}

// Local storage fallback functions
export function getCartFromLocalStorage(sessionId: string): CartItem[] {
  try {
    const cartData = localStorage.getItem(`cart_${sessionId}`);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
}

export function saveCartToLocalStorage(sessionId: string, items: CartItem[]) {
  try {
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

export function syncCartWithFirestore(sessionId: string) {
  // This function would sync local storage cart with Firestore
  // when the user comes online or the app starts
  return new Promise<void>(async (resolve, reject) => {
    try {
      const localItems = getCartFromLocalStorage(sessionId);
      const firestoreItems = await getCartItems(sessionId);
      
      // Simple merge strategy: local storage takes precedence
      for (const localItem of localItems) {
        const existingItem = firestoreItems.find(item => item.productId === localItem.productId);
        if (existingItem) {
          await updateCartItemQuantity(existingItem.id, localItem.quantity);
        } else {
          await addToCart(sessionId, localItem);
        }
      }
      
      resolve();
    } catch (error) {
      console.error('Error syncing cart:', error);
      reject(error);
    }
  });
}
