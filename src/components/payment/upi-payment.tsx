'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, QrCode, Smartphone, Timer, AlertTriangle } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface UPIPaymentProps {
  amount: number
  orderId: string
  onPaymentComplete: (transactionId: string) => void
  onPaymentCancel: () => void
}

export function UPIPayment({ 
  amount, 
  orderId, 
  onPaymentComplete, 
  onPaymentCancel 
}: UPIPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'id'>('qr')
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [transactionId, setTransactionId] = useState('')

  // Generate UPI QR code URL
  useEffect(() => {
    const merchantUPI = process.env.NEXT_PUBLIC_MERCHANT_UPI || 'merchant@paytm'
    const merchantName = process.env.NEXT_PUBLIC_MERCHANT_NAME || 'FlipkartClone'
    
    // UPI URL format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tr=<TRANSACTION_ID>&tn=<NOTE>
    const upiUrl = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${amount}&tr=${orderId}&tn=Payment for Order ${orderId}`
    
    // Generate QR code using a QR code service (you can replace with your preferred service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`
    setQrCodeUrl(qrUrl)
  }, [amount, orderId])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onPaymentCancel()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onPaymentCancel])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyUPIId = () => {
    const merchantUPI = process.env.NEXT_PUBLIC_MERCHANT_UPI || 'merchant@paytm'
    navigator.clipboard.writeText(merchantUPI)
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard",
    })
  }

  const handleManualEntry = async () => {
    if (!upiId.trim()) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate transaction ID
      const txnId = `TXN${Date.now()}`
      setTransactionId(txnId)
      
      // In a real implementation, you would:
      // 1. Send payment request to UPI service
      // 2. Verify payment status
      // 3. Update order status
      
      onPaymentComplete(txnId)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process UPI payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyPayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real implementation, you would:
      // 1. Check payment status with your payment gateway
      // 2. Verify transaction details
      // 3. Update order status
      
      const txnId = `TXN${Date.now()}`
      setTransactionId(txnId)
      onPaymentComplete(txnId)
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to verify payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Payment Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            UPI Payment
          </CardTitle>
          <CardDescription>
            Pay ₹{amount.toFixed(2)} using UPI
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Timer className="h-4 w-4 text-orange-500" />
        <span className="text-orange-500 font-medium">
          Time remaining: {formatTime(timeLeft)}
        </span>
      </div>

      {/* Payment Method Selector */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={paymentMethod === 'qr' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('qr')}
          className="h-12"
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
        <Button
          variant={paymentMethod === 'id' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('id')}
          className="h-12"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          UPI ID
        </Button>
      </div>

      {/* QR Code Payment */}
      {paymentMethod === 'qr' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Scan QR Code</CardTitle>
            <CardDescription>
              Open any UPI app and scan the QR code below
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <Image
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Or pay using UPI ID:</p>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="text-sm font-mono">
                  {process.env.NEXT_PUBLIC_MERCHANT_UPI || 'merchant@paytm'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyUPIId}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">GPay</Badge>
              <Badge variant="outline">PhonePe</Badge>
              <Badge variant="outline">Paytm</Badge>
              <Badge variant="outline">BHIM</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleVerifyPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying Payment...' : 'I have paid'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* UPI ID Payment */}
      {paymentMethod === 'id' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enter UPI ID</CardTitle>
            <CardDescription>
              Enter your UPI ID to complete the payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="text-center"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Payment Details:</p>
                  <p>Amount: ₹{amount.toFixed(2)}</p>
                  <p>Order ID: {orderId}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleManualEntry}
              disabled={isProcessing || !upiId.trim()}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Success State */}
      {transactionId && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-800">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-600">
                Transaction ID: {transactionId}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={onPaymentCancel}
        disabled={isProcessing}
      >
        Cancel Payment
      </Button>
    </div>
  )
}
