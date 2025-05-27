'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Mail,
  Download,
  Share2,
  ArrowLeft,
  Home
} from 'lucide-react';

interface OrderSuccessData {
  orderId: string;
  amount: number;
  paymentMethod: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching order details
    const fetchOrderDetails = async () => {
      try {
        // In a real app, you would fetch this from your API
        const mockOrderData: OrderSuccessData = {
          orderId,
          amount: 1299,
          paymentMethod: 'UPI',
          estimatedDelivery: '3-5 business days',
          trackingNumber: `TRK${orderId.slice(-8).toUpperCase()}`,
          items: [
            {
              id: '1',
              name: 'Sample Product',
              quantity: 1,
              price: 1299
            }
          ]
        };
        
        setTimeout(() => {
          setOrderData(mockOrderData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    console.log('Downloading invoice for order:', orderId);
  };

  const handleShareOrder = () => {
    // Simulate sharing order details
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmation',
        text: `My order ${orderId} has been successfully placed!`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find details for order: {orderId}
            </p>
            <Button onClick={() => router.push('/orders')}>
              View All Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. Your order has been confirmed and is being processed.
              </p>
              <Badge variant="outline" className="text-sm">
                Order #{orderId}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold">₹{orderData.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{orderData.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold">{orderData.estimatedDelivery}</p>
                </div>
                {orderData.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold">{orderData.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* What&apos;s Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                What&apos;s Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p className="text-sm text-gray-600">
                      You&apos;ll receive an email confirmation with your order details shortly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-600">
                      Your order will be processed and prepared for shipment within 1-2 business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Shipping Updates</p>
                    <p className="text-sm text-gray-600">
                      You&apos;ll receive tracking information once your order ships.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShareOrder}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Order
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 flex-1"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}