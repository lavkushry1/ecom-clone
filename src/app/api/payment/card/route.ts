import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardNumber, expiryDate, cvv, amount, currency = 'USD' } = body;

    // Validate required fields
    if (!cardNumber || !expiryDate || !cvv || !amount) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Basic card number validation (this is a demo - use proper validation in production)
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return NextResponse.json(
        { error: 'Invalid card number' },
        { status: 400 }
      );
    }

    // Simulate payment processing (replace with actual payment gateway integration)
    const paymentId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        paymentId,
        transactionId: `txn_${paymentId}`,
        amount,
        currency,
        status: 'completed',
        message: 'Payment processed successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment processing failed',
          code: 'PAYMENT_DECLINED'
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}