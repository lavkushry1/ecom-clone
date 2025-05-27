import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getAllOrders, updateOrderStatus } from '@/lib/actions/order-actions';
import { OrderStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const orders = await getAllOrders(limit);
    
    return NextResponse.json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.sessionId || !body.items || !body.total || !body.deliveryAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: sessionId, items, total, deliveryAddress' 
        },
        { status: 400 }
      );
    }

    const orderId = await createOrder(body);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: orderId } 
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order ID and status are required' 
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid order status' 
        },
        { status: 400 }
      );
    }

    await updateOrderStatus(id, status);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('PATCH /api/orders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order status' 
      },
      { status: 500 }
    );
  }
}
