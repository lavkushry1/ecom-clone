'use client'

import { useState, useEffect } from 'react'
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import type { Product } from '@/types'

interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}

interface UseWishlistReturn {
  wishlist: WishlistItem[]
  loading: boolean
  error: string | null
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
}

const WISHLIST_STORAGE_KEY = 'flipkart-wishlist'

export function useWishlist(): UseWishlistReturn {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setUserLoading(false)
    })

    return unsubscribe
  }, [])

  // Load wishlist from localStorage for guests
  const loadLocalWishlist = (): WishlistItem[] => {
    try {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save wishlist to localStorage for guests
  const saveLocalWishlist = (items: WishlistItem[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
      }
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error)
    }
  }

  // Sync local wishlist to Firestore when user logs in
  const syncLocalToFirestore = async (userId: string) => {
    try {
      const localWishlist = loadLocalWishlist()
      if (localWishlist.length === 0) return

      // Add each item to Firestore
      for (const item of localWishlist) {
        const wishlistRef = doc(db, `users/${userId}/wishlist`, item.productId)
        await setDoc(wishlistRef, {
          productId: item.productId,
          product: item.product,
          addedAt: item.addedAt
        })
      }

      // Clear localStorage after sync
      localStorage.removeItem(WISHLIST_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to sync local wishlist to Firestore:', error)
    }
  }

  // Initialize wishlist
  useEffect(() => {
    if (userLoading) return

    if (user) {
      // User is logged in - use Firestore
      const unsubscribe = onSnapshot(
        query(
          collection(db, `users/${user.uid}/wishlist`),
          orderBy('addedAt', 'desc')
        ),
        (snapshot) => {
          const items: WishlistItem[] = []
          snapshot.forEach((doc) => {
            items.push({
              id: doc.id,
              ...doc.data()
            } as WishlistItem)
          })
          setWishlist(items)
          setLoading(false)
        },
        (error) => {
          setError(error.message)
          setLoading(false)
        }
      )

      // Sync local wishlist to Firestore
      syncLocalToFirestore(user.uid)

      return unsubscribe
    } else {
      // Guest user - use localStorage
      const localWishlist = loadLocalWishlist()
      setWishlist(localWishlist)
      setLoading(false)
    }
  }, [user, userLoading])

  const addToWishlist = async (product: Product) => {
    try {
      const wishlistItem: WishlistItem = {
        id: product.id,
        productId: product.id,
        product,
        addedAt: new Date().toISOString()
      }

      if (user) {
        // Add to Firestore
        const wishlistRef = doc(db, `users/${user.uid}/wishlist`, product.id)
        await setDoc(wishlistRef, {
          productId: product.id,
          product,
          addedAt: wishlistItem.addedAt
        })
      } else {
        // Add to localStorage
        const currentWishlist = loadLocalWishlist()
        const updatedWishlist = [wishlistItem, ...currentWishlist.filter(item => item.productId !== product.id)]
        saveLocalWishlist(updatedWishlist)
        setWishlist(updatedWishlist)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to wishlist')
      throw error
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      if (user) {
        // Remove from Firestore
        const wishlistRef = doc(db, `users/${user.uid}/wishlist`, productId)
        await deleteDoc(wishlistRef)
      } else {
        // Remove from localStorage
        const currentWishlist = loadLocalWishlist()
        const updatedWishlist = currentWishlist.filter(item => item.productId !== productId)
        saveLocalWishlist(updatedWishlist)
        setWishlist(updatedWishlist)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove from wishlist')
      throw error
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId)
  }

  const clearWishlist = async () => {
    try {
      if (user) {
        // Clear Firestore wishlist
        const wishlistQuery = query(collection(db, `users/${user.uid}/wishlist`))
        const snapshot = await getDocs(wishlistQuery)
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      } else {
        // Clear localStorage
        localStorage.removeItem(WISHLIST_STORAGE_KEY)
        setWishlist([])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear wishlist')
      throw error
    }
  }

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  }
}
