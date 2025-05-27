import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as QRCode from 'qrcode'
import { z } from 'zod'

const db = admin.firestore()

// Generate UPI payment details and QR code
export const generateUPIPaymentDetails = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    orderId: z.string(),
    amount: z.number().positive(),
    customerName: z.string().optional()
  })

  try {
    const { orderId, amount, customerName } = schema.parse(data)

    // Get UPI ID from settings
    const settingsDoc = await db.collection('settings').doc('payment').get()
    const settings = settingsDoc.data()
    
    if (!settings || !settings.upiId) {
      throw new functions.https.HttpsError('failed-precondition', 'UPI ID not configured')
    }

    const upiId = settings.upiId

    // Create UPI payment string
    const upiString = `upi://pay?pa=${upiId}&pn=Flipkart%20Clone&am=${amount}&cu=INR&tn=Order%20${orderId}${customerName ? `%20from%20${encodeURIComponent(customerName)}` : ''}`

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Store payment details
    await db.collection('payments').doc(orderId).set({
      orderId,
      amount,
      upiId,
      upiString,
      qrCode: qrCodeDataURL,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      upiId,
      upiString,
      qrCode: qrCodeDataURL,
      amount,
      orderId
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid payment data')
    }
    console.error('Error generating UPI payment details:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate payment details')
  }
})

// Verify payment status
export const verifyPaymentStatus = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    orderId: z.string(),
    paymentMethod: z.enum(['upi', 'card'])
  })

  try {
    const { orderId, paymentMethod } = schema.parse(data)

    // Get payment record
    const paymentDoc = await db.collection('payments').doc(orderId).get()
    
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment record not found')
    }

    const payment = paymentDoc.data()

    // For demo purposes, simulate payment verification
    // In production, this would integrate with actual payment gateway
    const isVerified = Math.random() > 0.1 // 90% success rate for demo

    const newStatus = isVerified ? 'completed' : 'failed'
    
    // Update payment status
    await paymentDoc.ref.update({
      status: newStatus,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod
    })

    // If payment is verified, update order status
    if (isVerified) {
      const orderRef = db.collection('orders').doc(orderId)
      await orderRef.update({
        paymentStatus: 'paid',
        status: 'processing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        trackingHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'Payment Received',
          timestamp: new Date().toISOString(),
          description: 'Payment has been received and order is being processed',
          location: 'Payment Gateway'
        })
      })
    }

    return {
      orderId,
      paymentStatus: newStatus,
      verified: isVerified,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid verification data')
    }
    console.error('Error verifying payment:', error)
    throw new functions.https.HttpsError('internal', 'Failed to verify payment')
  }
})

// Process payment (for card payments)
export const processPayment = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    orderId: z.string(),
    paymentMethod: z.enum(['upi', 'card']),
    amount: z.number().positive(),
    cardDetails: z.object({
      cardNumber: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      cvv: z.string(),
      cardHolderName: z.string()
    }).optional(),
    otp: z.string().optional()
  })

  try {
    const { orderId, paymentMethod, amount, cardDetails, otp } = schema.parse(data)

    // Validate OTP for card payments
    if (paymentMethod === 'card' && (!otp || otp.length !== 6)) {
      throw new functions.https.HttpsError('invalid-argument', 'Valid OTP required for card payments')
    }

    // For demo purposes, simulate payment processing
    const processingTime = Math.random() * 3000 + 2000 // 2-5 seconds

    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Simulate payment success/failure
    const isSuccess = Math.random() > 0.05 // 95% success rate

    const paymentResult = {
      orderId,
      paymentMethod,
      amount,
      status: isSuccess ? 'completed' : 'failed',
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: isSuccess ? null : 'Payment processing failed'
    }

    // Store payment result
    await db.collection('payments').doc(orderId).set({
      ...paymentResult,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true })

    // Update order if payment successful
    if (isSuccess) {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'paid',
        status: 'processing',
        transactionId: paymentResult.transactionId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        trackingHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'Payment Processed',
          timestamp: new Date().toISOString(),
          description: 'Payment has been successfully processed',
          location: 'Payment Gateway'
        })
      })
    }

    return paymentResult
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid payment data')
    }
    console.error('Error processing payment:', error)
    throw new functions.https.HttpsError('internal', 'Payment processing failed')
  }
})
