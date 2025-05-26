'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Copy, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UPIQRCodeProps {
  orderId: string
  amount: number
  upiId?: string
  merchantName?: string
  onPaymentSuccess?: (transactionId: string) => void
  onPaymentFailure?: (error: string) => void
}

export function UPIQRCode({
  orderId,
  amount,
  upiId = "merchant@paytm",
  merchantName = "Flipkart",
  onPaymentSuccess,
  onPaymentFailure
}: UPIQRCodeProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [transactionId, setTransactionId] = useState<string>('')
  const { toast } = useToast()

  // Generate UPI payment string
  const generateUPIString = () => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}&tr=${orderId}`
    return upiString
  }

  // Simulate payment verification (in real app, this would be handled by backend)
  const simulatePaymentVerification = () => {
    setPaymentStatus('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2 // 80% success rate for demo
      
      if (isSuccess) {
        const mockTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        setTransactionId(mockTransactionId)
        setPaymentStatus('success')
        onPaymentSuccess?.(mockTransactionId)
        toast({
          title: "Payment Successful!",
          description: `Transaction ID: ${mockTransactionId}`,
        })
      } else {
        setPaymentStatus('failed')
        onPaymentFailure?.('Payment verification failed. Please try again.')
        toast({
          title: "Payment Failed",
          description: "Please try again or use a different payment method.",
          variant: "destructive"
        })
      }
    }, 3000)
  }

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setPaymentStatus('failed')
      onPaymentFailure?.('Payment timeout. Please try again.')
    }
  }, [timeLeft, paymentStatus, onPaymentFailure])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const copyUPIString = () => {
    navigator.clipboard.writeText(generateUPIString())
    toast({
      title: "UPI String Copied",
      description: "Paste it in your UPI app to complete payment.",
    })
  }

  const downloadQR = () => {
    const svg = document.querySelector('#upi-qr-code')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `upi-qr-${orderId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Waiting for Payment</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-blue-600"><Clock className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>
      case 'success':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Payment Successful</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Payment Failed</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-between">
          <span>Pay with UPI</span>
          {getStatusBadge()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan QR code with any UPI app
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-4 bg-white rounded-lg border">
          <QRCodeSVG
            id="upi-qr-code"
            value={generateUPIString()}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* Timer */}
        {paymentStatus === 'pending' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Time remaining: <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </p>
          </div>
        )}

        {/* Transaction ID */}
        {paymentStatus === 'success' && transactionId && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">Transaction ID:</p>
            <p className="text-sm font-mono text-green-700">{transactionId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {paymentStatus === 'pending' && (
            <>
              <Button 
                onClick={simulatePaymentVerification} 
                className="w-full"
                variant="default"
              >
                I've Made the Payment
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyUPIString} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy UPI String
                </Button>
                
                <Button 
                  onClick={downloadQR} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download QR
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'processing' && (
            <Button disabled className="w-full">
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Verifying Payment...
            </Button>
          )}

          {paymentStatus === 'failed' && (
            <Button 
              onClick={() => {
                setPaymentStatus('pending')
                setTimeLeft(600)
              }} 
              className="w-full"
              variant="default"
            >
              Try Again
            </Button>
          )}
        </div>

        {/* UPI Apps */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Popular UPI Apps:</p>
          <div className="flex justify-center gap-3">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
              <div key={app} className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <span className="text-xs font-medium">{app.slice(0, 2)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{app}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UPIQRCode
