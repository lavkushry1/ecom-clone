'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { migrateCart } from './cart'

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional()
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  photoURL: z.string().url().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required')
  }).optional()
})

// Helper function to create a session cookie
async function createSessionCookie(idToken: string, expiresIn: number = 60 * 60 * 24 * 5 * 1000) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
  
  cookies().set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: expiresIn / 1000, // Convert to seconds
    path: '/'
  })
  
  return sessionCookie
}

// Sign up with email and password
export async function signUp(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    
    // Validate inputs
    const validatedData = signUpSchema.parse({ 
      email, 
      password, 
      name,
      phone: phone || undefined
    })
    
    // Create user with Firebase Admin Auth
    const userRecord = await adminAuth.createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.name,
      phoneNumber: validatedData.phone
    })
    
    // Create user profile doc in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email: validatedData.email,
      name: validatedData.name,
      phone: validatedData.phone || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'customer' // Default role
    })
    
    // Get session ID to migrate cart
    const cookieStore = cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    
    if (sessionId) {
      await migrateCart(userRecord.uid, sessionId)
    }
    
    return { success: true, userId: userRecord.uid }
  } catch (error) {
    console.error('Sign up error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    
    // Firebase Auth errors
    const firebaseError = error as { code?: string, message: string }
    if (firebaseError.code === 'auth/email-already-exists') {
      return { success: false, error: 'Email already in use' }
    }
    
    return { success: false, error: 'Failed to sign up' }
  }
}

// Sign in with email and password
export async function signIn(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const idToken = formData.get('idToken') as string
    
    // Validate inputs if no idToken provided
    if (!idToken) {
      signInSchema.parse({ email, password })
      
      // This is a bit tricky since the Admin SDK doesn't have a direct sign-in method
      // We would typically handle this in the client and then create a session cookie
      return { success: false, error: 'ID token is required, please use the client-side sign-in' }
    }
    
    // Create session cookie
    const sessionCookie = await createSessionCookie(idToken)
    
    // Get user ID from token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    
    // Get session ID to migrate cart
    const cookieStore = cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    
    if (sessionId) {
      await migrateCart(decodedToken.uid, sessionId)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Sign in error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    
    // Firebase Auth errors
    const firebaseError = error as { code?: string, message: string }
    if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
      return { success: false, error: 'Invalid email or password' }
    }
    
    return { success: false, error: 'Failed to sign in' }
  }
}

// Sign out
export async function signOut() {
  try {
    cookies().delete('session')
    
    // Clear any other auth-related cookies
    cookies().delete('firebase-token')
    
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'Failed to sign out' }
  }
}

// Update user profile
export async function updateUserProfile(userId: string, formData: FormData) {
  try {
    // Extract data
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const photoURL = formData.get('photoURL') as string
    
    // Parse address if all fields are present
    const street = formData.get('street') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const zipCode = formData.get('zipCode') as string
    const country = formData.get('country') as string
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (photoURL) updateData.photoURL = photoURL
    
    // Validate inputs
    const validatedData = updateProfileSchema.parse({
      name: name || undefined,
      phone: phone || undefined,
      photoURL: photoURL || undefined,
      ...(street && city && state && zipCode && country ? {
        address: {
          street,
          city,
          state,
          zipCode,
          country
        }
      } : {})
    })
    
    // Update user profile in Firebase Auth
    const authUpdateData: any = {}
    if (validatedData.name) authUpdateData.displayName = validatedData.name
    if (validatedData.phone) authUpdateData.phoneNumber = validatedData.phone
    if (validatedData.photoURL) authUpdateData.photoURL = validatedData.photoURL
    
    // Only call update if we have changes
    if (Object.keys(authUpdateData).length > 0) {
      await adminAuth.updateUser(userId, authUpdateData)
    }
    
    // Update user profile in Firestore
    if (validatedData.address) {
      // If updating address
      const userRef = adminDb.collection('users').doc(userId)
      const userDoc = await userRef.get()
      
      if (userDoc.exists) {
        const userData = userDoc.data() || {}
        const addresses = userData.addresses || []
        
        // Check if address already exists
        const existingAddressIndex = addresses.findIndex((addr: any) => 
          addr.isDefault === true
        )
        
        if (existingAddressIndex >= 0) {
          // Update existing address
          addresses[existingAddressIndex] = {
            ...addresses[existingAddressIndex],
            ...validatedData.address,
            updatedAt: new Date()
          }
        } else {
          // Add new address
          addresses.push({
            ...validatedData.address,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
        
        updateData.addresses = addresses
      }
    }
    
    // Update Firestore user document
    await adminDb.collection('users').doc(userId).update(updateData)
    
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    
    return { success: false, error: 'Failed to update profile' }
  }
}

// Get current user from session cookie
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return { user: null }
    }
    
    // Verify session
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie, 
      true // Check if revoked
    )
    
    // Get user record
    const userRecord = await adminAuth.getUser(decodedClaims.uid)
    
    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get()
    const userData = userDoc.exists ? userDoc.data() : null
    
    // Combine auth and Firestore data
    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName || userData?.name,
      photoURL: userRecord.photoURL,
      role: userData?.role || 'customer',
      emailVerified: userRecord.emailVerified,
      phone: userRecord.phoneNumber || userData?.phone,
      addresses: userData?.addresses || [],
      createdAt: userData?.createdAt
    }
    
    return { user }
  } catch (error) {
    // Session cookie is invalid or expired
    cookies().delete('session')
    return { user: null }
  }
} 