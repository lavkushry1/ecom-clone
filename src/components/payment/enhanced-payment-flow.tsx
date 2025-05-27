'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Wallet, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  name: string;
  icon: React.ReactNode;
  description: string;
  isActive: boolean;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  saveCard: boolean;
}

interface UPIDetails {
  vpa: string;
  amount: number;
}

interface UPIQRResponse {
  qrCode: string;
  vpa: string;
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  paymentDetails: any;
}

interface UPIQRResponse {
  qrCode: string;
  vpa: string;
}

interface PaymentResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
  paymentId?: string;
}

interface EnhancedPaymentFlowProps {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export default function EnhancedPaymentFlow({
  orderId,
  amount,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}: EnhancedPaymentFlowProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    saveCard: false
  });
  const [upiDetails, setUPIDetails] = useState<UPIDetails>({
    vpa: '',
    amount: amount
  });
  const [qrCode, setQrCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay securely with your credit or debit card',
      isActive: true
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay instantly using UPI ID or scan QR code',
      isActive: true
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallet',
      icon: <Wallet className="w-6 h-6" />,
      description: 'PayTM, PhonePe, Google Pay and more',
      isActive: true
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      icon: <Shield className="w-6 h-6" />,
      description: 'Pay directly from your bank account',
      isActive: true
    }
  ];

  useEffect(() => {
    // Load saved cards for the user
    loadSavedCards();
  }, []);

  useEffect(() => {
    if (selectedMethod === 'upi') {
      generateUPIQR();
    }
  }, [selectedMethod, amount]);

  const loadSavedCards = async () => {
    try {
      // This would typically fetch from your backend
      // For now, we'll use mock data
      setSavedCards([
        {
          id: 'card1',
          last4: '4567',
          brand: 'Visa',
          expiry: '12/25'
        },
        {
          id: 'card2',
          last4: '8901',
          brand: 'Mastercard',
          expiry: '03/26'
        }
      ]);
    } catch (error) {
      console.error('Error loading saved cards:', error);
    }
  };

  const generateUPIQR = async () => {
    try {
      const generateUPIPaymentDetails = httpsCallable(functions, 'generateUPIPaymentDetails');
      const result = await generateUPIPaymentDetails({
        amount,
        orderId,
        customerInfo
      });

      if (result.data) {
        const data = result.data as UPIQRResponse;
        setQrCode(data.qrCode);
        setUPIDetails(prev => ({
          ...prev,
          vpa: data.vpa || prev.vpa
        }));
      }
    } catch (error) {
      console.error('Error generating UPI QR:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate UPI payment details',
        variant: 'destructive'
      });
    }
  };

  const validateCardDetails = (): boolean => {
    if (!cardDetails.number || cardDetails.number.length < 16) {
      toast({
        title: 'Invalid Card Number',
        description: 'Please enter a valid card number',
        variant: 'destructive'
      });
      return false;
    }

    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      toast({
        title: 'Invalid Expiry',
        description: 'Please enter expiry in MM/YY format',
        variant: 'destructive'
      });
      return false;
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast({
        title: 'Invalid CVV',
        description: 'Please enter a valid CVV',
        variant: 'destructive'
      });
      return false;
    }

    if (!cardDetails.name.trim()) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter cardholder name',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const validateUPIDetails = (): boolean => {
    if (!upiDetails.vpa || !upiDetails.vpa.includes('@')) {
      toast({
        title: 'Invalid UPI ID',
        description: 'Please enter a valid UPI ID',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    try {
      setProcessing(true);
      setPaymentStatus('processing');

      let paymentDetails: any = {};
      let isValid = true;

      switch (selectedMethod) {
        case 'card':
          isValid = validateCardDetails();
          paymentDetails = {
            type: 'card',
            card: {
              number: cardDetails.number,
              expiry: cardDetails.expiry,
              cvv: cardDetails.cvv,
              name: cardDetails.name
            },
            saveCard: cardDetails.saveCard
          };
          break;

        case 'upi':
          isValid = validateUPIDetails();
          paymentDetails = {
            type: 'upi',
            vpa: upiDetails.vpa,
            qrCode: qrCode
          };
          break;

        case 'wallet':
          paymentDetails = {
            type: 'wallet',
            provider: 'paytm' // This would be selected by user
          };
          break;

        case 'netbanking':
          paymentDetails = {
            type: 'netbanking',
            bank: 'hdfc' // This would be selected by user
          };
          break;

        default:
          toast({
            title: 'Error',
            description: 'Please select a payment method',
            variant: 'destructive'
          });
          return;
      }

      if (!isValid) {
        setProcessing(false);
        setPaymentStatus('idle');
        return;
      }

      const paymentRequest: PaymentRequest = {
        orderId,
        amount,
        currency: 'INR',
        customerInfo,
        paymentMethod: selectedMethod,
        paymentDetails
      };

      const processPaymentFunction = httpsCallable(functions, 'processPayment');
      const result = await processPaymentFunction(paymentRequest);

      if (result.data) {
        const data = result.data as PaymentResponse;
        if (data.success) {
          setPaymentStatus('success');
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully',
          });
          onPaymentSuccess(data);
        } else {
          throw new Error(data.error || 'Payment failed');
        }
      } else {
        throw new Error('No response from payment service');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      onPaymentError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-gray-600">
              Your payment of ₹{amount.toLocaleString()} has been processed successfully.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Order ID: {orderId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h3 className="text-xl font-semibold text-red-600">Payment Failed!</h3>
            <p className="text-gray-600">
              There was an issue processing your payment. Please try again.
            </p>
            <Button 
              onClick={() => {
                setPaymentStatus('idle');
                setSelectedMethod('');
              }} 
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">₹{amount.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>₹{amount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.filter(method => method.isActive).map((method) => (
                <div key={method.id} className="relative">
                  <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                  <Label
                    htmlFor={method.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0">{method.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {selectedMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter your {paymentMethods.find(m => m.id === selectedMethod)?.name} details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedMethod} className="w-full">
              {/* Credit/Debit Card */}
              <TabsContent value="card" className="space-y-4">
                {savedCards.length > 0 && (
                  <div className="space-y-3">
                    <Label>Saved Cards</Label>
                    {savedCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5" />
                          <div>
                            <div className="font-medium">**** **** **** {card.last4}</div>
                            <div className="text-sm text-gray-500">{card.brand} • Expires {card.expiry}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Use This Card</Button>
                      </div>
                    ))}
                    <Separator />
                    <Label>Or add a new card</Label>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        number: formatCardNumber(e.target.value).substring(0, 19)
                      }))}
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ 
                          ...prev, 
                          expiry: formatExpiry(e.target.value).substring(0, 5)
                        }))}
                        maxLength={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ 
                          ...prev, 
                          cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
                        }))}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Cardholder Name</Label>
                    <Input
                      id="cardholder-name"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        name: e.target.value
                      }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="save-card"
                      checked={cardDetails.saveCard}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        saveCard: e.target.checked
                      }))}
                    />
                    <Label htmlFor="save-card" className="text-sm">
                      Save this card for future payments
                    </Label>
                  </div>
                </div>
              </TabsContent>

              {/* UPI */}
              <TabsContent value="upi" className="space-y-4">
                <Tabs defaultValue="vpa" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vpa">UPI ID</TabsTrigger>
                    <TabsTrigger value="qr">QR Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="vpa" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input
                        id="upi-id"
                        placeholder="yourname@paytm"
                        value={upiDetails.vpa}
                        onChange={(e) => setUPIDetails(prev => ({ 
                          ...prev, 
                          vpa: e.target.value
                        }))}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="qr" className="space-y-4">
                    {qrCode ? (
                      <div className="text-center space-y-4">
                        <div className="bg-white p-4 rounded-lg border inline-block">
                          <img src={qrCode} alt="UPI QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Scan this QR code with any UPI app to pay ₹{amount.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span className="text-sm">PayTM, PhonePe, Google Pay, BHIM</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                        <p className="mt-2 text-gray-600">Generating QR code...</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Digital Wallet */}
              <TabsContent value="wallet" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {['PayTM', 'PhonePe', 'Google Pay', 'Amazon Pay'].map((wallet) => (
                    <Button key={wallet} variant="outline" className="h-16">
                      <div className="text-center">
                        <div className="font-medium">{wallet}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Net Banking */}
              <TabsContent value="netbanking" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB'].map((bank) => (
                    <Button key={bank} variant="outline" className="h-16">
                      <div className="text-center">
                        <div className="font-medium text-sm">{bank}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      {selectedMethod && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={processPayment} 
              disabled={processing || paymentStatus === 'processing'}
              className="w-full h-12 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Pay ₹{amount.toLocaleString()} Securely
                </>
              )}
            </Button>

            <div className="mt-4 text-center text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
