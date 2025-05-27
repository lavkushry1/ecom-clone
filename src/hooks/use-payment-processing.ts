'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Order, PaymentMethod, UPIPaymentData, CreditCardData, OrderStatus } from '@/types'

export interface PaymentProcessingState {
  step: 'method' | 'processing' | 'verification' | 'success' | 'failed'
  paymentMethod: PaymentMethod['type'] | null
  transactionId: string | null
  isProcessing: boolean
  error: string | null
  progress: number
}

interface UsePaymentProcessingReturn {
  state: PaymentProcessingState
  initializePayment: (method: PaymentMethod['type'], orderData: Partial<Order>) => Promise<void>
  processUPIPayment: (upiData: UPIPaymentData) => Promise<void>
  processCreditCardPayment: (cardData: CreditCardData) => Promise<void>
  verifyPayment: (verificationData: any) => Promise<void>
  resetPayment: () => void
  retryPayment: () => Promise<void>
}

export function usePaymentProcessing(): UsePaymentProcessingReturn {
  const router = useRouter()
  const { toast } = useToast()
  
  const [state, setState] = useState<PaymentProcessingState>({
    step: 'method',
    paymentMethod: null,
    transactionId: null,
    isProcessing: false,
    error: null,
    progress: 0
  })

  const [orderData, setOrderData] = useState<Partial<Order> | null>(null)

  // Update state helper
  const updateState = useCallback((updates: Partial<PaymentProcessingState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Initialize payment process
  const initializePayment = useCallback(async (method: PaymentMethod['type'], order: Partial<Order>) => {
    try {
      setOrderData(order)
      updateState({
        step: 'processing',
        paymentMethod: method,
        isProcessing: true,
        error: null,
        progress: 0
      })

      // Simulate API call to initialize payment
      updateState({ progress: 25 })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateState({ progress: 50 })
      
      // Generate transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      updateState({
        transactionId,
        progress: 75,
        step: method === 'upi' ? 'verification' : 'processing'
      })

      toast({
        title: "Payment Initialized",
        description: `Payment process started with ${method.toUpperCase()}`,
      })

    } catch (error) {
      updateState({
        step: 'failed',
        error: error instanceof Error ? error.message : 'Payment initialization failed',
        isProcessing: false
      })
      
      toast({
        title: "Payment Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast, updateState])

  // Process UPI payment
  const processUPIPayment = useCallback(async (upiData: UPIPaymentData) => {
    try {
      updateState({ isProcessing: true, error: null, progress: 25 })

      // Call backend API to process UPI payment
      const response = await fetch('/api/payment/upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: state.transactionId,
          upiId: upiData.upiId,
          amount: orderData?.total,
          orderId: orderData?.id
        }),
      })

      updateState({ progress: 50 })

      if (!response.ok) {
        throw new Error('UPI payment processing failed')
      }

      const result = await response.json()
      
      updateState({ progress: 75 })

      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateState({
        step: 'verification',
        progress: 90,
        isProcessing: false
      })

      toast({
        title: "UPI Payment Processing",
        description: "Please complete the payment in your UPI app",
      })

    } catch (error) {
      updateState({
        step: 'failed',
        error: error instanceof Error ? error.message : 'UPI payment failed',
        isProcessing: false
      })
      
      toast({
        title: "UPI Payment Failed",
        description: "Unable to process UPI payment. Please try again.",
        variant: "destructive"
      })
    }
  }, [state.transactionId, orderData, toast, updateState])

  // Process credit card payment
  const processCreditCardPayment = useCallback(async (cardData: CreditCardData) => {
    try {
      updateState({ isProcessing: true, error: null, progress: 25 })

      // Call backend API to process card payment
      const response = await fetch('/api/payment/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: state.transactionId,
          cardNumber: cardData.cardNumber,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          cvv: cardData.cvv,
          cardholderName: cardData.cardholderName,
          amount: orderData?.total,
          orderId: orderData?.id
        }),
      })

      updateState({ progress: 50 })

      if (!response.ok) {
        throw new Error('Card payment processing failed')
      }

      const result = await response.json()
      
      updateState({ progress: 75 })

      // Check if OTP verification is required
      if (result.requiresOTP) {
        updateState({
          step: 'verification',
          progress: 85,
          isProcessing: false
        })
        
        toast({
          title: "OTP Verification Required",
          description: "Please enter the OTP sent to your registered mobile number",
        })
      } else {
        // Direct success
        updateState({
          step: 'success',
          progress: 100,
          isProcessing: false
        })
        
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        })
        
        // Redirect to success page
        router.push(`/orders/${orderData?.id}/success`)
      }

    } catch (error) {
      updateState({
        step: 'failed',
        error: error instanceof Error ? error.message : 'Card payment failed',
        isProcessing: false
      })
      
      toast({
        title: "Payment Failed",
        description: "Unable to process card payment. Please try again.",
        variant: "destructive"
      })
    }
  }, [state.transactionId, orderData, router, toast, updateState])

  // Verify payment (OTP or other verification)
  const verifyPayment = useCallback(async (verificationData: any) => {
    try {
      updateState({ isProcessing: true, error: null, progress: 90 })

      // Call backend API to verify payment
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: state.transactionId,
          ...verificationData
        }),
      })

      if (!response.ok) {
        throw new Error('Payment verification failed')
      }

      const result = await response.json()

      if (result.success) {
        updateState({
          step: 'success',
          progress: 100,
          isProcessing: false
        })
        
        toast({
          title: "Payment Successful",
          description: "Your payment has been verified and processed successfully",
        })
        
        // Redirect to success page
        router.push(`/orders/${orderData?.id}/success`)
      } else {
        throw new Error(result.message || 'Payment verification failed')
      }

    } catch (error) {
      updateState({
        step: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed',
        isProcessing: false
      })
      
      toast({
        title: "Verification Failed",
        description: "Payment verification failed. Please try again.",
        variant: "destructive"
      })
    }
  }, [state.transactionId, orderData, router, toast, updateState])

  // Reset payment state
  const resetPayment = useCallback(() => {
    setState({
      step: 'method',
      paymentMethod: null,
      transactionId: null,
      isProcessing: false,
      error: null,
      progress: 0
    })
    setOrderData(null)
  }, [])

  // Retry payment
  const retryPayment = useCallback(async () => {
    if (!orderData || !state.paymentMethod) return
    
    updateState({
      step: 'processing',
      error: null,
      progress: 0
    })
    
    await initializePayment(state.paymentMethod, orderData)
  }, [orderData, state.paymentMethod, initializePayment, updateState])

  return {
    state,
    initializePayment,
    processUPIPayment,
    processCreditCardPayment,
    verifyPayment,
    resetPayment,
    retryPayment
  }
}
