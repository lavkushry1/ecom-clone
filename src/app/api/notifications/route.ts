import { NextRequest, NextResponse } from 'next/server';
import { auth, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// Get notification history
export async function GET(request: NextRequest) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const getNotificationHistory = httpsCallable(functions, 'getNotificationHistory');
    const result = await getNotificationHistory({ limit, page });

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get notifications' 
      },
      { status: 500 }
    );
  }
}

// Send notification
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
      case 'sendNotification':
        const sendNotification = httpsCallable(functions, 'sendNotification');
        result = await sendNotification(data);
        break;
        
      case 'sendBulkNotification':
        const sendBulkNotification = httpsCallable(functions, 'sendBulkNotification');
        result = await sendBulkNotification(data);
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
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Notification operation failed' 
      },
      { status: 500 }
    );
  }
}
