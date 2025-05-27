'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { FieldValue } from 'firebase-admin/firestore'

// Basic UPI validation schema
const upiPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  upiId: z.string().regex(/^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/, 'Invalid UPI ID format'),
  transactionId: z.string().optional()
})

// Credit card payment schema
const cardPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Invalid expiry year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  cardHolderName: z.string().min(3, 'Card holder name is required'),
})

// Generate UPI payment details
export async function generateUpiPaymentDetails(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string
    const amountStr = formData.get('amount') as string
    
    if (!orderId || !amountStr) {
      return { success: false, error: 'Order ID and amount are required' }
    }
    
    const amount = parseFloat(amountStr)
    
    // Get UPI ID from settings
    const settingsDoc = await adminDb.collection('settings').doc('payment').get()
    
    if (!settingsDoc.exists) {
      return { success: false, error: 'Payment settings not configured' }
    }
    
    const settings = settingsDoc.data()
    
    if (!settings?.upiId) {
      return { success: false, error: 'UPI payment not configured' }
    }
    
    // Create UPI payment string
    const upiPaymentData = {
      orderId,
      amount,
      upiId: settings.upiId,
      // Generate a transaction reference for tracking
      transactionRef: `TX${Date.now()}`
    }
    
    // Generate UPI URL (pa=payee account, pn=payee name, am=amount, tr=transaction ref, tn=transaction note)
    const upiUrl = `upi://pay?pa=${upiPaymentData.upiId}&pn=Flipkart%20Clone&am=${amount}&cu=INR&tr=${upiPaymentData.transactionRef}&tn=Order%20${orderId}`
    
    // Store payment in database for verification
    await adminDb.collection('payments').doc(upiPaymentData.transactionRef).set({
      orderId,
      amount,
      paymentMethod: 'upi',
      upiId: settings.upiId,
      transactionRef: upiPaymentData.transactionRef,
      status: 'initiated',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return { 
      success: true, 
      paymentDetails: {
        upiUrl,
        upiId: settings.upiId,
        amount,
        transactionRef: upiPaymentData.transactionRef
      } 
    }
  } catch (error) {
    console.error('Error generating UPI payment details:', error)
    return { success: false, error: 'Failed to generate UPI payment details' }
  }
}

// Verify UPI payment
export async function verifyUpiPayment(formData: FormData) {
  try {
    const transactionRef = formData.get('transactionRef') as string
    const transactionId = formData.get('transactionId') as string
    
    if (!transactionRef) {
      return { success: false, error: 'Transaction reference is required' }
    }
    
    // Get payment from database
    const paymentDoc = await adminDb.collection('payments').doc(transactionRef).get()
    
    if (!paymentDoc.exists) {
      return { success: false, error: 'Payment not found' }
    }
    
    const payment = paymentDoc.data()
    
    if (!payment) {
      return { success: false, error: 'Payment data is missing' }
    }
    
    if (payment.status === 'completed') {
      return { success: true, payment: { ...payment, id: paymentDoc.id } }
    }
    
    // For demo/development, we'll simulate payment verification
    // In production, this would verify with a real payment gateway
    
    // Update payment status
    await paymentDoc.ref.update({
      status: 'completed',
      transactionId: transactionId || `DEMO${Date.now()}`,
      verifiedAt: new Date(),
      updatedAt: new Date()
    })
    
    // Update order payment status
    await adminDb.collection('orders').doc(payment.orderId).update({
      paymentStatus: 'paid',
      status: 'confirmed',
      updatedAt: new Date(),
      trackingHistory: FieldValue.arrayUnion({
        status: 'Payment Received',
        timestamp: new Date(),
        description: 'Payment has been received and verified',
        location: 'Payment Gateway'
      })
    })
    
    revalidatePath(`/orders/${payment.orderId}`)
    
    return { 
      success: true, 
      payment: { 
        ...payment, 
        id: paymentDoc.id, 
        status: 'completed',
        transactionId: transactionId || `DEMO${Date.now()}`
      } 
    }
  } catch (error) {
    console.error('Error verifying UPI payment:', error)
    return { success: false, error: 'Failed to verify payment' }
  }
}

// Process credit card payment
export async function processCardPayment(formData: FormData) {
  try {
    // Extract form data
    const orderId = formData.get('orderId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const cardNumber = formData.get('cardNumber') as string
    const expiryMonth = formData.get('expiryMonth') as string
    const expiryYear = formData.get('expiryYear') as string
    const cvv = formData.get('cvv') as string
    const cardHolderName = formData.get('cardHolderName') as string
    
    // Validate form data
    cardPaymentSchema.parse({
      orderId,
      amount,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName
    })
    
    // In a real application, this would call a payment processor API
    // Here we'll simulate a card payment
    
    // Generate a transaction reference for tracking
    const transactionRef = `CC${Date.now()}${crypto.randomBytes(4).toString('hex')}`
    
    // Store payment in database
    await adminDb.collection('payments').doc(transactionRef).set({
      orderId,
      amount,
      paymentMethod: 'card',
      cardDetails: {
        cardNumber: `XXXX-XXXX-XXXX-${cardNumber.slice(-4)}`,
        expiryMonth,
        expiryYear,
        cardHolderName
      },
      transactionRef,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Simulate processing delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful payment
    await adminDb.collection('payments').doc(transactionRef).update({
      status: 'completed',
      transactionId: `CCTX${Date.now()}`,
      verifiedAt: new Date(),
      updatedAt: new Date()
    })
    
    // Update order payment status
    await adminDb.collection('orders').doc(orderId).update({
      paymentStatus: 'paid',
      status: 'confirmed',
      updatedAt: new Date(),
      trackingHistory: FieldValue.arrayUnion({
        status: 'Payment Received',
        timestamp: new Date(),
        description: 'Credit card payment has been processed successfully',
        location: 'Payment Gateway'
      })
    })
    
    revalidatePath(`/orders/${orderId}`)
    
    return { 
      success: true,
      transactionRef,
      redirectUrl: `/orders/${orderId}/success`
    }
  } catch (error) {
    console.error('Error processing card payment:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    
    return { success: false, error: 'Failed to process payment' }
  }
}

// Get payment status
export async function getPaymentStatus(transactionRef: string) {
  try {
    const paymentDoc = await adminDb.collection('payments').doc(transactionRef).get()
    
    if (!paymentDoc.exists) {
      return { success: false, error: 'Payment not found' }
    }
    
    const payment = paymentDoc.data()
    
    return { 
      success: true, 
      payment: { 
        ...payment, 
        id: paymentDoc.id 
      } 
    }
  } catch (error) {
    console.error('Error getting payment status:', error)
    return { success: false, error: 'Failed to get payment status' }
  }
} 