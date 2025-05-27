'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  Clock,
  Phone,
  Mail,
  Download,
  Share,
  ArrowRight,
  ArrowLeft,
  Copy,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

interface DeliveryAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
}

interface OrderSuccessData {
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  transactionId: string;
  orderDate: string;
  estimatedDelivery: string;
  deliveryAddress: DeliveryAddress;
  trackingNumber?: string;
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingVisible, setTrackingVisible] = useState(false);

  const orderId = params.orderId as string;
  const transactionId = searchParams.get('transactionId');
  const paymentMethod = searchParams.get('paymentMethod');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // In production, this would fetch from your API
        // For now, we'll simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        
        const mockOrderData: OrderSuccessData = {
          orderId,
          orderNumber: `FK${Date.now().toString().slice(-8)}`,
          items: [
            {
              id: '1',
              name: 'iPhone 15 Pro Max 256GB',
              price: 159900,
              quantity: 1,
              image: '/api/placeholder/400/400',
              brand: 'Apple'
            },
            {
              id: '2',
              name: 'Apple AirPods Pro (2nd Generation)',
              price: 24900,
              quantity: 1,
              image: '/api/placeholder/400/400',
              brand: 'Apple'
            }
          ],
          subtotal: 184800,
          shipping: 0,
          tax: 16632,
          discount: 5000,
          total: 196432,
          paymentMethod: paymentMethod || 'UPI',
          paymentStatus: 'paid',
          transactionId: transactionId || `TXN${Date.now()}`,
          orderDate: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: {
            fullName: 'John Doe',
            address: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phoneNumber: '9876543210'
          },
          trackingNumber: `TRK${Date.now().toString().slice(-6)}`,
          orderStatus: 'confirmed'
        };
        
        setOrderData(mockOrderData);
        
        // Show tracking info after a delay
        setTimeout(() => {
          setTrackingVisible(true);
        }, 3000);
        
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, transactionId, paymentMethod]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const copyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
    }
  };

  const copyTransactionId = () => {
    if (orderData?.transactionId) {
      navigator.clipboard.writeText(orderData.transactionId);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard",
      });
    }
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Download Started",
      description: "Your invoice is being generated and will download shortly",
    });
    // In production, this would trigger invoice download
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order ${orderData?.orderNumber} Confirmed`,
        text: `My order for ${formatPrice(orderData?.total || 0)} has been confirmed!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Order link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/orders')}>View All Orders</Button>
            <Button variant="outline" onClick={() => router.push('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/products')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-green-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-green-700 text-lg mb-4">
                  Your order has been confirmed and is being processed.
                </p>
                
                {/* Order Info Quick View */}
                <div className="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Order Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{orderData.orderNumber}</span>
                      <Button size="sm" variant="ghost" onClick={copyOrderNumber}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg">{formatPrice(orderData.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <Badge variant="secondary">{orderData.paymentMethod}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ordered: {new Date(orderData.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Est. Delivery: {new Date(orderData.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Transaction Details
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShareOrder}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{orderData.transactionId}</span>
                        <Button size="sm" variant="ghost" onClick={copyTransactionId}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <Badge className="bg-green-100 text-green-800">
                        {orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      <Badge className="bg-blue-100 text-blue-800">
                        {orderData.orderStatus.charAt(0).toUpperCase() + orderData.orderStatus.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-medium">{orderData.items.length} item(s)</p>
                    </div>
                  </div>

                  {trackingVisible && orderData.trackingNumber && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Tracking Information</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Tracking Number: <span className="font-mono">{orderData.trackingNumber}</span>
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/orders/${orderData.orderId}`)}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Ordered ({orderData.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.items.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.brand}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                          </div>
                        </div>
                        {index < orderData.items.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(orderData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderData.shipping === 0 ? 'FREE' : formatPrice(orderData.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(orderData.tax)}</span>
                  </div>
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(orderData.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatPrice(orderData.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{orderData.deliveryAddress.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {orderData.deliveryAddress.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} - {orderData.deliveryAddress.pincode}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                    <Phone className="h-4 w-4" />
                    <span>{orderData.deliveryAddress.phoneNumber}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => router.push('/orders')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/products')}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/support')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'Order Placed', time: orderData.orderDate, completed: true, icon: Package },
                  { status: 'Payment Confirmed', time: orderData.orderDate, completed: true, icon: CheckCircle },
                  { status: 'Processing', time: null, completed: false, icon: Clock },
                  { status: 'Shipped', time: null, completed: false, icon: Truck },
                  { status: 'Out for Delivery', time: null, completed: false, icon: Truck },
                  { status: 'Delivered', time: orderData.estimatedDelivery, completed: false, icon: Package }
                ].map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                          {step.status}
                        </p>
                        {step.time && (
                          <p className="text-sm text-gray-500">
                            {new Date(step.time).toLocaleDateString()} at {new Date(step.time).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      {step.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardContent className="p-6 text-center bg-gray-50">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                You'll receive email updates about your order. If you have questions, our support team is here to help.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
