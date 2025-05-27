'use client'

import { useState, useEffect, useContext } from 'react'
import { User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  addresses: Address[]
  preferences: {
    notifications: boolean
    newsletter: boolean
    theme: 'light' | 'dark' | 'system'
  }
  createdAt: string
  lastLoginAt: string
  isAdmin?: boolean
}

export interface Address {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  type: 'home' | 'office' | 'other'
}

interface UseAuthReturn {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>
  updateAddress: (addressId: string, data: Partial<Address>) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  setDefaultAddress: (addressId: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        setError(null)
        
        if (firebaseUser) {
          setUser(firebaseUser)
          await fetchUserProfile(firebaseUser.uid)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile)
      } else {
        // Create default profile for new users
        const defaultProfile: UserProfile = {
          uid,
          email: user?.email || '',
          displayName: user?.displayName || '',
          photoURL: user?.photoURL || '',
          phoneNumber: user?.phoneNumber || '',
          addresses: [],
          preferences: {
            notifications: true,
            newsletter: false,
            theme: 'system'
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isAdmin: false
        }
        
        await setDoc(userDocRef, defaultProfile)
        setUserProfile(defaultProfile)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load user profile')
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
      throw err
    }
  }

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated')
    }

    try {
      const userDocRef = doc(db, 'users', user.uid)
      const updatedData = {
        ...data,
        lastLoginAt: new Date().toISOString()
      }
      
      await updateDoc(userDocRef, updatedData)
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed')
      throw err
    }
  }

  // Add new address
  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated')
    }

    try {
      const newAddress: Address = {
        ...addressData,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // If this is the first address or marked as default, set as default
      if (userProfile.addresses.length === 0 || addressData.isDefault) {
        // Remove default from other addresses
        const updatedAddresses = userProfile.addresses.map(addr => ({
          ...addr,
          isDefault: false
        }))
        newAddress.isDefault = true
        
        await updateProfile({
          addresses: [...updatedAddresses, newAddress]
        })
      } else {
        await updateProfile({
          addresses: [...userProfile.addresses, newAddress]
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add address')
      throw err
    }
  }

  // Update existing address
  const updateAddress = async (addressId: string, data: Partial<Address>) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated')
    }

    try {
      const updatedAddresses = userProfile.addresses.map(addr => {
        if (addr.id === addressId) {
          return { ...addr, ...data }
        }
        // If setting this address as default, remove default from others
        if (data.isDefault) {
          return { ...addr, isDefault: false }
        }
        return addr
      })

      await updateProfile({ addresses: updatedAddresses })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address')
      throw err
    }
  }

  // Delete address
  const deleteAddress = async (addressId: string) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated')
    }

    try {
      const filteredAddresses = userProfile.addresses.filter(addr => addr.id !== addressId)
      
      // If we deleted the default address and there are other addresses, make the first one default
      if (userProfile.addresses.find(addr => addr.id === addressId)?.isDefault && filteredAddresses.length > 0) {
        filteredAddresses[0].isDefault = true
      }

      await updateProfile({ addresses: filteredAddresses })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address')
      throw err
    }
  }

  // Set default address
  const setDefaultAddress = async (addressId: string) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated')
    }

    try {
      const updatedAddresses = userProfile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))

      await updateProfile({ addresses: updatedAddresses })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address')
      throw err
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return
    
    try {
      await fetchUserProfile(user.uid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile')
      throw err
    }
  }

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: userProfile?.isAdmin || false,
    signOut,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshProfile
  }
}
