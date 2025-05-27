import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for payment verification
const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  paymentMethod: z.enum(['upi', 'card']).optional(),
  orderId: z.string().optional(),
  amount: z.number().positive().optional(),
  // UPI specific fields
  upiTransactionId: z.string().optional(),
  upiReference: z.string().optional(),
  // Card specific fields
  cardLast4: z.string().optional(),
  cardType: z.string().optional(),
  // OTP verification
  otp: z.string().optional(),
  // Additional verification data
  verificationCode: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
});

interface PaymentVerificationResponse {
  success: boolean;
  transactionId: string;
  status: 'verified' | 'pending' | 'failed';
  amount?: number;
  paymentMethod?: string;
  verificationTime: string;
  gatewayResponse?: {
    code: string;
    message: string;
    reference?: string;
  };
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = verifyPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        errors: validationResult.error.issues.map(issue => issue.message),
        message: 'Invalid verification data'
      }, { status: 400 });
    }

    const {
      transactionId,
      paymentMethod,
      orderId,
      amount,
      upiTransactionId,
      upiReference,
      cardLast4,
      cardType,
      otp,
      verificationCode,
      customerPhone,
      customerEmail
    } = validationResult.data;

    // Simulate verification process based on payment method
    let verificationStatus: 'verified' | 'pending' | 'failed' = 'failed';
    let gatewayResponse = {
      code: 'VERIFICATION_FAILED',
      message: 'Payment verification failed'
    };

    // Simulate different verification scenarios for demo purposes
    if (paymentMethod === 'upi') {
      verificationStatus = await verifyUPIPayment({
        transactionId,
        upiTransactionId,
        upiReference,
        amount
      });
      
      if (verificationStatus === 'verified') {
        gatewayResponse = {
          code: 'UPI_SUCCESS',
          message: 'UPI payment verified successfully',
          reference: upiReference || `UPI${Date.now()}`
        };
      }
    } else if (paymentMethod === 'card') {
      verificationStatus = await verifyCardPayment({
        transactionId,
        cardLast4,
        cardType,
        otp,
        amount
      });
      
      if (verificationStatus === 'verified') {
        gatewayResponse = {
          code: 'CARD_SUCCESS',
          message: 'Card payment verified successfully',
          reference: `CARD${Date.now()}`
        };
      }
    } else {
      // Generic verification for other payment methods
      verificationStatus = await verifyGenericPayment({
        transactionId,
        verificationCode,
        amount
      });
      
      if (verificationStatus === 'verified') {
        gatewayResponse = {
          code: 'PAYMENT_SUCCESS',
          message: 'Payment verified successfully'
        };
      }
    }

    // Log verification attempt (in production, this would be proper logging)
    console.log('Payment verification attempt:', {
      transactionId,
      paymentMethod,
      status: verificationStatus,
      timestamp: new Date().toISOString()
    });

    // If verification is successful, update order status
    if (verificationStatus === 'verified' && orderId) {
      await updateOrderPaymentStatus(orderId, {
        status: 'paid',
        transactionId,
        paymentMethod: paymentMethod || 'unknown',
        amount,
        verificationTime: new Date().toISOString()
      });
    }

    const response: PaymentVerificationResponse = {
      success: verificationStatus === 'verified',
      transactionId,
      status: verificationStatus,
      amount,
      paymentMethod,
      verificationTime: new Date().toISOString(),
      gatewayResponse
    };

    return NextResponse.json(response, {
      status: verificationStatus === 'verified' ? 200 : 400
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error during payment verification',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}

// UPI Payment Verification
async function verifyUPIPayment({
  transactionId,
  upiTransactionId,
  upiReference,
  amount
}: {
  transactionId: string;
  upiTransactionId?: string;
  upiReference?: string;
  amount?: number;
}): Promise<'verified' | 'pending' | 'failed'> {
  
  // Simulate UPI verification with payment gateway
  // In production, this would call the actual UPI gateway API
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate verification logic
  if (transactionId.includes('FAIL')) {
    return 'failed';
  }
  
  if (transactionId.includes('PENDING')) {
    return 'pending';
  }
  
  // Simulate high success rate for demo
  const successRate = 0.85;
  const isSuccess = Math.random() < successRate;
  
  return isSuccess ? 'verified' : 'failed';
}

// Card Payment Verification
async function verifyCardPayment({
  transactionId,
  cardLast4,
  cardType,
  otp,
  amount
}: {
  transactionId: string;
  cardLast4?: string;
  cardType?: string;
  otp?: string;
  amount?: number;
}): Promise<'verified' | 'pending' | 'failed'> {
  
  // Simulate card verification with payment gateway
  // In production, this would call the actual card gateway API
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
  
  // Simulate OTP verification
  if (otp) {
    // For demo purposes, accept common test OTPs
    const validOTPs = ['123456', '000000', '111111'];
    if (!validOTPs.includes(otp)) {
      return 'failed';
    }
  }
  
  // Simulate verification logic
  if (transactionId.includes('FAIL')) {
    return 'failed';
  }
  
  if (transactionId.includes('PENDING')) {
    return 'pending';
  }
  
  // Simulate high success rate for demo
  const successRate = 0.80;
  const isSuccess = Math.random() < successRate;
  
  return isSuccess ? 'verified' : 'failed';
}

// Generic Payment Verification
async function verifyGenericPayment({
  transactionId,
  verificationCode,
  amount
}: {
  transactionId: string;
  verificationCode?: string;
  amount?: number;
}): Promise<'verified' | 'pending' | 'failed'> {
  
  // Simulate generic verification
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple verification logic
  if (transactionId.includes('FAIL')) {
    return 'failed';
  }
  
  return Math.random() < 0.75 ? 'verified' : 'failed';
}

// Update Order Payment Status
async function updateOrderPaymentStatus(
  orderId: string,
  paymentData: {
    status: string;
    transactionId: string;
    paymentMethod: string;
    amount?: number;
    verificationTime: string;
  }
) {
  try {
    // In production, this would update the order in Firestore
    console.log('Updating order payment status:', {
      orderId,
      ...paymentData
    });
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Failed to update order payment status:', error);
    return false;
  }
}

// GET endpoint for payment status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: 'Transaction ID is required'
      }, { status: 400 });
    }
    
    // Simulate checking payment status
    // In production, this would query the database or payment gateway
    const mockStatus = {
      transactionId,
      status: 'verified',
      amount: 50000,
      paymentMethod: 'upi',
      verificationTime: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: mockStatus
    });
    
  } catch (error) {
    console.error('Payment status check error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to check payment status'
    }, { status: 500 });
  }
}
