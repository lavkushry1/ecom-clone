'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

export interface DeliveryAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
}

export interface OrderConfirmationData {
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
  orderDate: string;
  estimatedDelivery: string;
  deliveryAddress: DeliveryAddress;
  trackingNumber?: string;
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface OrderConfirmationProps {
  orderData: OrderConfirmationData;
  className?: string;
}

export function OrderConfirmation({ orderData, className = '' }: OrderConfirmationProps) {
  const router = useRouter();
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);

  useEffect(() => {
    // Simulate showing tracking info after order processing
    const timer = setTimeout(() => {
      setShowTrackingInfo(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    const invoiceData = {
      orderNumber: orderData.orderNumber,
      date: orderData.orderDate,
      total: orderData.total,
    };
    
    console.log('Downloading invoice:', invoiceData);
    // In real implementation, this would generate and download a PDF
  };

  const handleShareOrder = () => {
    if (typeof window === 'undefined') return;
    
    if (navigator.share) {
      navigator.share({
        title: `Order ${orderData.orderNumber} Confirmed`,
        text: `Your order for ${formatPrice(orderData.total)} has been confirmed!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-green-700 mb-4">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Order Date: {new Date(orderData.orderDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Estimated Delivery: {new Date(orderData.estimatedDelivery).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
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
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{orderData.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <Badge className={getStatusColor(orderData.orderStatus)}>
                    {orderData.orderStatus.charAt(0).toUpperCase() + orderData.orderStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge className={getPaymentStatusColor(orderData.paymentStatus)}>
                    {orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {showTrackingInfo && orderData.trackingNumber && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Tracking Information</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Tracking Number: <span className="font-mono">{orderData.trackingNumber}</span>
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/orders/${orderData.orderId}/track`)}
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
                    {index < orderData.items.length - 1 && <hr className="mt-4 border-gray-200" />}
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
              <hr className="border-gray-200" />
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
              <CardTitle>Quick Actions</CardTitle>
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

      {/* Order Timeline (if tracking info is available) */}
      {showTrackingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: 'Order Confirmed', time: orderData.orderDate, completed: true },
                { status: 'Processing', time: null, completed: false },
                { status: 'Shipped', time: null, completed: false },
                { status: 'Out for Delivery', time: null, completed: false },
                { status: 'Delivered', time: orderData.estimatedDelivery, completed: false }
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.status}
                    </p>
                    {step.time && (
                      <p className="text-sm text-gray-500">
                        {new Date(step.time).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mock data for development
export const mockOrderData: OrderConfirmationData = {
  orderId: 'ord_1234567890',
  orderNumber: 'ECM-2024-001234',
  items: [
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 159900,
      quantity: 1,
      image: '/api/placeholder/300/300',
      brand: 'Apple'
    },
    {
      id: '2',
      name: 'Apple MagSafe Charger',
      price: 4500,
      quantity: 1,
      image: '/api/placeholder/300/300',
      brand: 'Apple'
    }
  ],
  subtotal: 164400,
  shipping: 0,
  tax: 14796,
  discount: 5000,
  total: 174196,
  paymentMethod: 'UPI',
  paymentStatus: 'paid',
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
  trackingNumber: 'TRK123456789',
  orderStatus: 'confirmed'
};
