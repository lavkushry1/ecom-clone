import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      transactionId, 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      cardholderName, 
      amount, 
      orderId 
    } = body

    // Validate required fields
    if (!transactionId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic card validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    
    // Validate card number (basic Luhn algorithm check)
    if (!isValidCardNumber(cleanCardNumber)) {
      return NextResponse.json(
        { error: 'Invalid card number' },
        { status: 400 }
      )
    }

    // Validate expiry date
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
      return NextResponse.json(
        { error: 'Card has expired' },
        { status: 400 }
      )
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
      return NextResponse.json(
        { error: 'Invalid CVV' },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Detect card type
    const cardType = detectCardType(cleanCardNumber)
    
    // Get last 4 digits for response
    const last4 = cleanCardNumber.slice(-4)

    console.log('Processing card payment:', {
      transactionId,
      cardType,
      last4,
      amount,
      orderId,
      cardholderName,
      timestamp: new Date().toISOString()
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate success/failure based on card number (for demo purposes)
    const shouldSucceed = !cleanCardNumber.startsWith('4000000000000002') // Test failure card
    const requiresOTP = cleanCardNumber.startsWith('4000000000000119') || Math.random() > 0.3 // Simulate OTP requirement

    if (shouldSucceed) {
      const gatewayTransactionId = `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (requiresOTP) {
        // Requires OTP verification
        const paymentResponse = {
          success: true,
          requiresOTP: true,
          transactionId,
          gatewayTransactionId,
          status: 'otp_required',
          amount,
          currency: 'INR',
          cardType,
          last4,
          orderId,
          message: 'OTP has been sent to your registered mobile number',
          otpReference: `otp_${Date.now()}`,
          timestamp: new Date().toISOString()
        }

        return NextResponse.json(paymentResponse)
      } else {
        // Direct success (rare case)
        const paymentResponse = {
          success: true,
          requiresOTP: false,
          transactionId,
          gatewayTransactionId,
          status: 'completed',
          amount,
          currency: 'INR',
          cardType,
          last4,
          orderId,
          message: 'Payment completed successfully',
          timestamp: new Date().toISOString()
        }

        return NextResponse.json(paymentResponse)
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Card payment declined',
          transactionId,
          message: 'Your card was declined. Please check your card details or try a different card.',
          errorCode: 'CARD_DECLINED'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Card payment processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to process payment request. Please try again.'
      },
      { status: 500 }
    )
  }
}

// Basic Luhn algorithm implementation for card validation
function isValidCardNumber(cardNumber: string): boolean {
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false
  }

  let sum = 0
  let shouldDouble = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

// Detect card type based on card number
function detectCardType(cardNumber: string): string {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    rupay: /^60|^65|^81|^82/
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type
    }
  }

  return 'unknown'
}
