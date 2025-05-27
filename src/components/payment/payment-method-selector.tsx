'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Smartphone, QrCode, Zap, Shield, Clock } from 'lucide-react'
import { UPIPayment } from './upi-payment'
import { CreditCardPayment } from './credit-card-form'

interface PaymentMethodSelectorProps {
  orderId: string
  amount: number
  onPaymentSuccess?: (transactionId: string, method: 'upi' | 'card') => void
  onPaymentFailure?: (error: string, method: 'upi' | 'card') => void
}

export function PaymentMethodSelector({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentFailure
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi')

  const handlePaymentSuccess = (transactionId: string) => {
    onPaymentSuccess?.(transactionId, selectedMethod)
  }

  const handlePaymentFailure = (error: string) => {
    onPaymentFailure?.(error, selectedMethod)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Methods Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Choose Payment Method</CardTitle>
          <p className="text-center text-muted-foreground">
            Select your preferred payment option for Order #{orderId}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UPI Option */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedMethod === 'upi' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMethod('upi')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">UPI Payment</h3>
                    <p className="text-sm text-muted-foreground">Instant & Secure</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Instant payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Bank-level security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Works with all UPI apps</span>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-1">
                  <Badge variant="secondary" className="text-xs">GPay</Badge>
                  <Badge variant="secondary" className="text-xs">PhonePe</Badge>
                  <Badge variant="secondary" className="text-xs">Paytm</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Option */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedMethod === 'card' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMethod('card')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Credit/Debit Card</h3>
                    <p className="text-sm text-muted-foreground">All major cards</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">SSL encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm">OTP verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ZIP code validation</span>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-1">
                  <Badge variant="secondary" className="text-xs">Visa</Badge>
                  <Badge variant="secondary" className="text-xs">Mastercard</Badge>
                  <Badge variant="secondary" className="text-xs">Amex</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Interface */}
      <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'upi' | 'card')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upi" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            UPI Payment
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card Payment
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upi" className="mt-6">
          <UPIPayment
            orderId={orderId}
            amount={amount}
            onPaymentComplete={handlePaymentSuccess}
            onPaymentCancel={() => handlePaymentFailure('Payment cancelled by user')}
          />
        </TabsContent>
        
        <TabsContent value="card" className="mt-6">
          <CreditCardPayment
            orderId={orderId}
            amount={amount}
            onPaymentComplete={handlePaymentSuccess}
            onPaymentCancel={() => handlePaymentFailure('Payment cancelled by user')}
          />
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">Secure Payment</h4>
              <p className="text-sm text-green-700">
                Your payment information is encrypted and processed securely. 
                We never store your card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentMethodSelector
