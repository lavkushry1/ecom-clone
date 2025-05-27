'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { CartItem, Product } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Define custom types for the server-side cart
interface ServerCartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

// Schema for cart item validation
const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

// Generate a session ID if one doesn't exist
function getOrCreateSessionId(): string {
  const cookieStore = cookies()
  let sessionId = cookieStore.get('sessionId')?.value
  
  if (!sessionId) {
    sessionId = uuidv4()
    cookieStore.set('sessionId', sessionId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
  }
  
  return sessionId
}

// Add item to cart
export async function addToCart(productId: string, quantity: number = 1, userId?: string) {
  try {
    const validatedData = cartItemSchema.parse({ productId, quantity })
    
    // Get product details
    const productDoc = await adminDb.collection('products').doc(productId).get()
    if (!productDoc.exists) {
      return { success: false, error: 'Product not found' }
    }
    
    const productData = productDoc.data()
    const product = {
      id: productDoc.id,
      ...productData
    } as Product
    
    // Check if stock is available
    if ((product.stock ?? 0) < quantity) {
      return { 
        success: false, 
        error: 'Not enough stock available',
        availableStock: product.stock ?? 0
      }
    }
    
    let cartRef
    
    if (userId) {
      // User cart
      cartRef = adminDb.collection('carts').doc(userId)
    } else {
      // Guest cart
      const sessionId = getOrCreateSessionId()
      cartRef = adminDb.collection('guestCarts').doc(sessionId)
    }
    
    // Get current cart
    const cartDoc = await cartRef.get()
    
    // Create a server cart item
    const serverCartItem: ServerCartItem = {
      productId,
      name: product.name || 'Product Name',
      price: product.salePrice || 0,
      quantity: validatedData.quantity,
      image: product.images?.[0] || '',
    }
    
    if (!cartDoc.exists) {
      // Create new cart
      await cartRef.set({
        items: [serverCartItem],
        updatedAt: new Date()
      })
    } else {
      // Update existing cart
      const cartData = cartDoc.data()
      const cart = cartData ? cartData : { items: [] }
      const existingItemIndex = cart.items.findIndex((item: ServerCartItem) => item.productId === productId)
      
      if (existingItemIndex >= 0) {
        // Update existing item
        cart.items[existingItemIndex].quantity += validatedData.quantity
      } else {
        // Add new item
        cart.items.push(serverCartItem)
      }
      
      await cartRef.update({
        items: cart.items,
        updatedAt: new Date()
      })
    }
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error adding item to cart:', error)
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, error: 'Failed to add item to cart' }
  }
}

// Remove item from cart
export async function removeFromCart(productId: string, userId?: string) {
  try {
    let cartRef
    
    if (userId) {
      cartRef = adminDb.collection('carts').doc(userId)
    } else {
      const sessionId = getOrCreateSessionId()
      cartRef = adminDb.collection('guestCarts').doc(sessionId)
    }
    
    const cartDoc = await cartRef.get()
    
    if (!cartDoc.exists) {
      return { success: false, error: 'Cart not found' }
    }
    
    const cartData = cartDoc.data()
    if (!cartData) {
      return { success: false, error: 'Cart is empty' }
    }
    
    const filteredItems = cartData.items.filter((item: ServerCartItem) => item.productId !== productId)
    
    await cartRef.update({
      items: filteredItems,
      updatedAt: new Date()
    })
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error removing item from cart:', error)
    return { success: false, error: 'Failed to remove item from cart' }
  }
}

// Update item quantity
export async function updateCartItemQuantity(productId: string, quantity: number, userId?: string) {
  try {
    const validatedData = cartItemSchema.parse({ productId, quantity })
    
    // If quantity is 0 or negative, remove the item
    if (validatedData.quantity <= 0) {
      return removeFromCart(productId, userId)
    }
    
    let cartRef
    
    if (userId) {
      cartRef = adminDb.collection('carts').doc(userId)
    } else {
      const sessionId = getOrCreateSessionId()
      cartRef = adminDb.collection('guestCarts').doc(sessionId)
    }
    
    const cartDoc = await cartRef.get()
    
    if (!cartDoc.exists) {
      return { success: false, error: 'Cart not found' }
    }
    
    const cartData = cartDoc.data()
    if (!cartData) {
      return { success: false, error: 'Cart is empty' }
    }
    
    const itemIndex = cartData.items.findIndex((item: ServerCartItem) => item.productId === productId)
    
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in cart' }
    }
    
    // Check stock availability
    const productDoc = await adminDb.collection('products').doc(productId).get()
    if (!productDoc.exists) {
      return { success: false, error: 'Product not found' }
    }
    
    const productData = productDoc.data()
    const product = productData ? { id: productId, ...productData } as Product : null
    
    if (!product || (product.stock ?? 0) < validatedData.quantity) {
      return { 
        success: false, 
        error: 'Not enough stock available',
        availableStock: product?.stock ?? 0
      }
    }
    
    // Update quantity
    cartData.items[itemIndex].quantity = validatedData.quantity
    
    await cartRef.update({
      items: cartData.items,
      updatedAt: new Date()
    })
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, error: 'Failed to update cart item quantity' }
  }
}

// Clear cart
export async function clearCart(userId?: string) {
  try {
    let cartRef
    
    if (userId) {
      cartRef = adminDb.collection('carts').doc(userId)
    } else {
      const sessionId = getOrCreateSessionId()
      cartRef = adminDb.collection('guestCarts').doc(sessionId)
    }
    
    await cartRef.update({
      items: [],
      updatedAt: new Date()
    })
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

// Get cart contents
export async function getCart(userId?: string) {
  try {
    let cartRef
    
    if (userId) {
      cartRef = adminDb.collection('carts').doc(userId)
    } else {
      const sessionId = getOrCreateSessionId()
      cartRef = adminDb.collection('guestCarts').doc(sessionId)
    }
    
    const cartDoc = await cartRef.get()
    
    if (!cartDoc.exists) {
      // Return empty cart
      return { 
        success: true, 
        cart: { 
          items: [], 
          subtotal: 0, 
          itemCount: 0 
        } 
      }
    }
    
    const cartData = cartDoc.data()
    if (!cartData || !cartData.items) {
      return { 
        success: true, 
        cart: { 
          items: [], 
          subtotal: 0, 
          itemCount: 0 
        } 
      }
    }
    
    // Calculate totals
    const items = cartData.items as ServerCartItem[]
    const itemCount = items.reduce((acc: number, item) => acc + item.quantity, 0)
    const subtotal = items.reduce((acc: number, item) => acc + (item.price * item.quantity), 0)
    
    return { 
      success: true, 
      cart: { 
        items, 
        subtotal,
        itemCount 
      } 
    }
  } catch (error) {
    console.error('Error getting cart:', error)
    return { success: false, error: 'Failed to get cart' }
  }
}

// Migrate guest cart to user cart
export async function migrateCart(userId: string, sessionId: string) {
  try {
    const guestCartRef = adminDb.collection('guestCarts').doc(sessionId)
    const guestCartDoc = await guestCartRef.get()
    
    if (!guestCartDoc.exists) {
      return { success: true } // No guest cart to migrate
    }
    
    const guestCartData = guestCartDoc.data()
    if (!guestCartData) {
      return { success: true } // Empty guest cart
    }
    
    const userCartRef = adminDb.collection('carts').doc(userId)
    const userCartDoc = await userCartRef.get()
    
    if (!userCartDoc.exists) {
      // Create user cart with guest items
      await userCartRef.set({
        items: guestCartData.items,
        updatedAt: new Date()
      })
    } else {
      // Merge items
      const userCartData = userCartDoc.data()
      if (!userCartData) {
        await userCartRef.set({
          items: guestCartData.items,
          updatedAt: new Date()
        })
      } else {
        const mergedItems = [...(userCartData.items || [])]
        
        for (const guestItem of guestCartData.items as ServerCartItem[]) {
          const existingItemIndex = mergedItems.findIndex((item: ServerCartItem) => item.productId === guestItem.productId)
          
          if (existingItemIndex >= 0) {
            // Update quantity for existing items
            mergedItems[existingItemIndex].quantity += guestItem.quantity
          } else {
            // Add new items
            mergedItems.push(guestItem)
          }
        }
        
        await userCartRef.update({
          items: mergedItems,
          updatedAt: new Date()
        })
      }
    }
    
    // Clear guest cart
    await guestCartRef.delete()
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error migrating cart:', error)
    return { success: false, error: 'Failed to migrate cart' }
  }
} 