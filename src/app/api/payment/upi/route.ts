import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vpa, amount, currency = 'INR', transactionNote } = body;

    // Validate required fields
    if (!vpa || !amount) {
      return NextResponse.json(
        { error: 'Missing required UPI information' },
        { status: 400 }
      );
    }

    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(vpa)) {
      return NextResponse.json(
        { error: 'Invalid UPI ID format' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0 || amount > 100000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between ₹1 and ₹1,00,000' },
        { status: 400 }
      );
    }

    // Generate UPI payment request string
    const upiString = `upi://pay?pa=${vpa}&pn=Flipkart%20Clone&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote || 'Payment')}`;
    
    // Simulate payment processing (replace with actual UPI payment gateway integration)
    const paymentId = `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate success/failure (95% success rate for UPI)
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        paymentId,
        transactionId: `txn_${paymentId}`,
        upiString,
        amount,
        currency,
        vpa,
        status: 'pending', // UPI payments typically start as pending
        message: 'UPI payment request generated successfully',
        qrData: upiString // For QR code generation
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'UPI payment request failed',
          code: 'UPI_REQUEST_FAILED'
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('UPI payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get payment status
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');
  
  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  // Simulate payment status check
  const statuses = ['pending', 'completed', 'failed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return NextResponse.json({
    paymentId,
    status: randomStatus,
    timestamp: new Date().toISOString()
  });
}