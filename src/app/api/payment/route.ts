import { NextRequest, NextResponse } from 'next/server';
import { processPayment, validateZipCode } from '@/lib/actions/order-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'process') {
      // Process payment
      if (!data.orderId || !data.paymentMethod || !data.amount) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing required fields: orderId, paymentMethod, amount' 
          },
          { status: 400 }
        );
      }

      const paymentId = await processPayment(data);
      
      return NextResponse.json({ 
        success: true, 
        data: { paymentId } 
      });
    } else if (action === 'validate-zip') {
      // Validate ZIP code
      if (!data.zipCode) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'ZIP code is required' 
          },
          { status: 400 }
        );
      }

      const isValid = await validateZipCode(data.zipCode);
      
      return NextResponse.json({ 
        success: true, 
        data: { isValid } 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid action. Supported actions: process, validate-zip' 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/payment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment operation failed' 
      },
      { status: 500 }
    );
  }
}
