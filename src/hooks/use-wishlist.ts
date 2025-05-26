'use client'

import { useState, useEffect } from 'react'

interface UseWishlistReturn {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (productId: string) => void
  clearWishlist: () => void
}

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<string[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  const addItem = (productId: string) => {
    setItems(prevItems => {
      if (!prevItems.includes(productId)) {
        return [...prevItems, productId]
      }
      return prevItems
    })
  }

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(id => id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return items.includes(productId)
  }

  const toggleItem = (productId: string) => {
    if (isInWishlist(productId)) {
      removeItem(productId)
    } else {
      addItem(productId)
    }
  }

  const clearWishlist = () => {
    setItems([])
  }

  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
    toggleItem,
    clearWishlist
  }
}
