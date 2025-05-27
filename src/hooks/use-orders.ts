'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Order } from '@/types'
import { useToast } from './use-toast'

interface UseOrdersOptions {
  userId?: string
  status?: string
  limit?: number
}

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateOrderStatus: (orderId: string, status: string) => Promise<void>
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      let q = query(collection(db, 'orders'))

      // Add filters
      const constraints: any[] = []
      
      if (options.userId) {
        constraints.push(where('userId', '==', options.userId))
      }
      
      if (options.status) {
        constraints.push(where('status', '==', options.status))
      }

      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'))

      // Add limit
      if (options.limit) {
        constraints.push(limit(options.limit))
      }

      if (constraints.length > 0) {
        q = query(collection(db, 'orders'), ...constraints)
      }

      const querySnapshot = await getDocs(q)
      const ordersData: Order[] = []

      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as Order)
      })

      setOrders(ordersData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      )

      toast({
        title: 'Success',
        description: 'Order status updated successfully'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      throw err
    }
  }

  const refetch = async () => {
    await fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
  }, [options.userId, options.status, options.limit])

  return {
    orders,
    loading,
    error,
    refetch,
    updateOrderStatus
  }
}
