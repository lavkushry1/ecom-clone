'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Smartphone 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Credit card validation schema
const cardSchema = z.object({
  cardNumber: z.string()
    .min(16, 'Card number must be 16 digits')
    .max(19, 'Card number is too long')
    .regex(/^[\d\s]+$/, 'Card number can only contain digits'),
  expiryMonth: z.string()
    .min(1, 'Month is required')
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string()
    .min(2, 'Year is required')
    .regex(/^\d{2}$/, 'Year must be 2 digits'),
  cvv: z.string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be at most 4 digits')
    .regex(/^\d+$/, 'CVV can only contain digits'),
  cardholderName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  zipCode: z.string()
    .min(6, 'ZIP code must be 6 digits')
    .max(6, 'ZIP code must be 6 digits')
    .regex(/^\d{6}$/, 'ZIP code must be 6 digits'),
})

type CardForm = z.infer<typeof cardSchema>

interface CreditCardPaymentProps {
  orderId: string
  amount: number
  onPaymentSuccess?: (transactionId: string) => void
  onPaymentFailure?: (error: string) => void
}

export function CreditCardPayment({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentFailure
}: CreditCardPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCVV, setShowCVV] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const { toast } = useToast()

  const form = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      zipCode: '',
    }
  })

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\s/g, '')
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim()
    return formatted.slice(0, 19) // Max 16 digits + 3 spaces
  }

  // Detect card type
  const getCardType = (cardNumber: string) => {
    const digits = cardNumber.replace(/\s/g, '')
    if (digits.startsWith('4')) return 'visa'
    if (digits.startsWith('5') || digits.startsWith('2')) return 'mastercard'
    if (digits.startsWith('3')) return 'amex'
    if (digits.startsWith('6')) return 'discover'
    return 'unknown'
  }

  // Validate card expiry
  const isCardExpired = (month: string, year: string) => {
    if (!month || !year) return false
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    const expYear = parseInt(year)
    const expMonth = parseInt(month)
    
    if (expYear < currentYear) return true
    if (expYear === currentYear && expMonth < currentMonth) return true
    return false
  }

  const onSubmit = async (data: CardForm) => {
    // Check if card is expired
    if (isCardExpired(data.expiryMonth, data.expiryYear)) {
      toast({
        title: "Card Expired",
        description: "Please use a valid card.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate card validation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate masked phone for OTP
      const phone = `+91-XXXXX-${Math.floor(1000 + Math.random() * 9000)}`
      setMaskedPhone(phone)
      setOtpStep(true)
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phone}`,
      })
    } catch (error) {
      onPaymentFailure?.('Card validation failed. Please check your details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const isSuccess = otp === '123456' || Math.random() > 0.3 // Accept 123456 or 70% success rate
      
      if (isSuccess) {
        const transactionId = `CC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        onPaymentSuccess?.(transactionId)
        toast({
          title: "Payment Successful!",
          description: `Transaction ID: ${transactionId}`,
        })
      } else {
        throw new Error('Invalid OTP')
      }
    } catch (error) {
      onPaymentFailure?.('OTP verification failed. Please try again.')
      toast({
        title: "Payment Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resendOTP = () => {
    setOtp('')
    toast({
      title: "OTP Resent",
      description: `New verification code sent to ${maskedPhone}`,
    })
  }

  if (otpStep) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5" />
            Verify OTP
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to {maskedPhone}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground text-center">
              Demo: Use <code className="bg-gray-100 px-1 rounded">123456</code> for successful payment
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={verifyOTP} 
              disabled={isProcessing || otp.length !== 6}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify & Pay
                </>
              )}
            </Button>

            <Button 
              onClick={resendOTP} 
              variant="outline" 
              className="w-full"
              disabled={isProcessing}
            >
              Resend OTP
            </Button>

            <Button 
              onClick={() => {
                setOtpStep(false)
                setOtp('')
                setMaskedPhone('')
              }} 
              variant="ghost" 
              className="w-full"
            >
              Back to Card Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay with Card
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Secure payment with SSL encryption
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount Display */}
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                {...form.register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(form.watch('cardNumber') || '')}
                onChange={(e) => form.setValue('cardNumber', e.target.value)}
                className={form.formState.errors.cardNumber ? 'border-red-500' : ''}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getCardType(form.watch('cardNumber')) !== 'unknown' && (
                  <Badge variant="outline" className="text-xs">
                    {getCardType(form.watch('cardNumber')).toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            {form.formState.errors.cardNumber && (
              <p className="text-sm text-red-500">{form.formState.errors.cardNumber.message}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              {...form.register('cardholderName')}
              placeholder="John Doe"
              className={form.formState.errors.cardholderName ? 'border-red-500' : ''}
            />
            {form.formState.errors.cardholderName && (
              <p className="text-sm text-red-500">{form.formState.errors.cardholderName.message}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                {...form.register('expiryMonth')}
                placeholder="MM"
                maxLength={2}
                className={form.formState.errors.expiryMonth ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                {...form.register('expiryYear')}
                placeholder="YY"
                maxLength={2}
                className={form.formState.errors.expiryYear ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  {...form.register('cvv')}
                  type={showCVV ? 'text' : 'password'}
                  placeholder="123"
                  maxLength={4}
                  className={form.formState.errors.cvv ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowCVV(!showCVV)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* ZIP Code */}
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              {...form.register('zipCode')}
              placeholder="400001"
              maxLength={6}
              className={form.formState.errors.zipCode ? 'border-red-500' : ''}
            />
            {form.formState.errors.zipCode && (
              <p className="text-sm text-red-500">{form.formState.errors.zipCode.message}</p>
            )}
          </div>

          {/* Security Info */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Your card details are encrypted and secure</span>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isProcessing || !form.formState.isValid}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay ₹{amount.toLocaleString('en-IN')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreditCardPayment
