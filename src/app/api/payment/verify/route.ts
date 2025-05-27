import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionId, method, otp } = body;

    // Validate required fields
    if (!paymentId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required payment verification information' },
        { status: 400 }
      );
    }

    // For OTP-based verification (UPI, NetBanking)
    if (method === 'upi' || method === 'netbanking') {
      if (!otp) {
        return NextResponse.json(
          { error: 'OTP is required for verification' },
          { status: 400 }
        );
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { error: 'Invalid OTP format. OTP must be 6 digits.' },
          { status: 400 }
        );
      }

      // Simulate OTP verification (for demo, accept 123456 as valid)
      if (otp !== '123456') {
        return NextResponse.json(
          { error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Simulate payment verification process
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate verification success/failure (90% success rate)
    const isVerified = Math.random() > 0.1;

    if (isVerified) {
      // Return successful verification
      return NextResponse.json({
        success: true,
        verificationId,
        paymentId,
        transactionId,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        message: 'Payment verified successfully',
        paymentDetails: {
          method,
          amount: 0, // You would get this from your payment records
          currency: 'INR'
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment verification failed',
          code: 'VERIFICATION_FAILED',
          paymentId,
          transactionId
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get verification status
  const { searchParams } = new URL(request.url);
  const verificationId = searchParams.get('verificationId');
  const paymentId = searchParams.get('paymentId');
  
  if (!verificationId && !paymentId) {
    return NextResponse.json(
      { error: 'Verification ID or Payment ID is required' },
      { status: 400 }
    );
  }

  // Simulate verification status lookup
  const statuses = ['pending', 'verified', 'failed', 'expired'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return NextResponse.json({
    verificationId: verificationId || `verify_${paymentId}`,
    paymentId,
    status: randomStatus,
    verifiedAt: randomStatus === 'verified' ? new Date().toISOString() : null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    attempts: Math.floor(Math.random() * 3) + 1
  });
}