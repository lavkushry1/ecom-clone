'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { 
  CreditCard,
  Smartphone,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalAmount, clearCart } = useCart();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const shipping = 0; // Free shipping
  const tax = Math.round(totalAmount * 0.18); // 18% GST
  const finalTotal = totalAmount + shipping + tax;

  // Redirect if cart is empty
  if (items.length === 0 && step !== 'confirmation') {
    router.push('/cart');
    return null;
  }

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentMethodSelect = (method: 'upi' | 'card') => {
    setPaymentMethod(method);
    setStep('payment');
  };

  const handlePaymentSuccess = (transactionId: string, method: 'upi' | 'card') => {
    // Generate order ID
    const newOrderId = `FK${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    setOrderId(newOrderId);
    
    // Clear cart
    clearCart();
    
    setStep('confirmation');
  };

  const handlePaymentFailure = (error: string, method: 'upi' | 'card') => {
    // Handle payment failure
    console.error(`Payment failed (${method}):`, error);
    // Could show error message or redirect back to payment selection
  };

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Confirmed!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your order. We've received your payment and will process your order shortly.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Order Number</div>
                <div className="text-xl font-bold text-gray-900">{orderId}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="text-left">
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items ({totalItems})</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (GST)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="font-semibold mb-2">Delivery Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>{customerInfo.name}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    <p>{customerInfo.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => router.push(`/orders/${orderId}`)} className="w-full">
                  Track Your Order
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/products')} 
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What's next?</strong><br />
                  Your order will be processed within 10 minutes. You'll receive an email confirmation and tracking details shortly.
                </p>
              </div>
            </CardContent>
          </Card>
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
            onClick={() => router.push('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'details' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCustomerInfoSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <Input
                            required
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            required
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            required
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              phone: e.target.value
                            }))}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address *
                          </label>
                          <Input
                            required
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress(prev => ({
                              ...prev,
                              street: e.target.value
                            }))}
                            placeholder="123 Main Street, Apartment 4B"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <Input
                              required
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress(prev => ({
                                ...prev,
                                city: e.target.value
                              }))}
                              placeholder="Mumbai"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <Input
                              required
                              value={shippingAddress.state}
                              onChange={(e) => setShippingAddress(prev => ({
                                ...prev,
                                state: e.target.value
                              }))}
                              placeholder="Maharashtra"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP Code *
                            </label>
                            <Input
                              required
                              value={shippingAddress.zipCode}
                              onChange={(e) => setShippingAddress(prev => ({
                                ...prev,
                                zipCode: e.target.value
                              }))}
                              placeholder="400001"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
                
                <PaymentMethodSelector
                  orderId={orderId || `FK${Date.now().toString().slice(-8)}`}
                  amount={finalTotal}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <div className="flex-1 truncate pr-2">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-gray-600"> × {item.quantity}</span>
                      </div>
                      <span>₹{(item.product.salePrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-green-800">
                  <div className="text-sm font-medium">🔒 Secure Checkout</div>
                  <div className="text-xs mt-1">
                    Your payment information is encrypted and secure
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
