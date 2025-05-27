import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Get inventory report
export async function GET(request: NextRequest) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const getInventoryReport = httpsCallable(functions, 'getInventoryReport');
    const result = await getInventoryReport({});

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get inventory report' 
      },
      { status: 500 }
    );
  }
}

// Update stock
export async function POST(request: NextRequest) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    let result;
    
    switch (action) {
      case 'updateStock':
        const updateStock = httpsCallable(functions, 'updateStock');
        result = await updateStock(data);
        break;
        
      case 'bulkUpdateStock':
        const bulkUpdateStock = httpsCallable(functions, 'bulkUpdateStock');
        result = await bulkUpdateStock(data);
        break;
        
      case 'setStockAlert':
        const setStockAlert = httpsCallable(functions, 'setStockAlert');
        result = await setStockAlert(data);
        break;
        
      case 'createRestockRequest':
        const createRestockRequest = httpsCallable(functions, 'createRestockRequest');
        result = await createRestockRequest(data);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('POST /api/inventory error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Inventory operation failed' 
      },
      { status: 500 }
    );
  }
}
