'use client'

import { useState } from 'react'
import { useForm, ControllerRenderProps, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

const creditCardSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  cardholderName: z.string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(50, 'Cardholder name must be at most 50 characters'),
  expiryMonth: z.string()
    .min(1, 'Please select expiry month'),
  expiryYear: z.string()
    .min(1, 'Please select expiry year'),
  cvv: z.string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be at most 4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
  saveCard: z.boolean().optional()
})

type CreditCardForm = z.infer<typeof creditCardSchema>

interface CreditCardPaymentProps {
  amount: number
  orderId: string
  onPaymentComplete: (transactionId: string, cardDetails: any) => void
  onPaymentCancel: () => void
}

export function CreditCardPayment({ 
  amount, 
  orderId, 
  onPaymentComplete, 
  onPaymentCancel 
}: CreditCardPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCVV, setShowCVV] = useState(false)
  const [cardType, setCardType] = useState<string>('')

  const form = useForm<CreditCardForm>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false
    }
  })

  // Detect card type based on card number
  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    
    if (/^4/.test(cleanNumber)) return 'visa'
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard'
    if (/^3[47]/.test(cleanNumber)) return 'amex'
    if (/^6/.test(cleanNumber)) return 'discover'
    if (/^35/.test(cleanNumber)) return 'jcb'
    if (/^30/.test(cleanNumber)) return 'dinersclub'
    
    return ''
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '')
    const groups = cleanValue.match(/(\d{1,4})/g)
    return groups ? groups.join(' ') : ''
  }

  // Generate months and years for select options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0')
    return { value: month, label: month }
  })

  const years = Array.from({ length: 20 }, (_, i) => {
    const year = (new Date().getFullYear() + i).toString()
    return { value: year, label: year }
  })

  const onSubmit = async (data: CreditCardForm) => {
    setIsProcessing(true)
    
    try {
      // Validate expiry date
      const currentDate = new Date()
      const expiryDate = new Date(parseInt(data.expiryYear), parseInt(data.expiryMonth) - 1)
      
      if (expiryDate < currentDate) {
        toast({
          title: "Invalid Expiry Date",
          description: "Card has expired. Please use a valid card.",
          variant: "destructive"
        })
        setIsProcessing(false)
        return
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, you would:
      // 1. Tokenize card details
      // 2. Send to payment gateway
      // 3. Handle 3D Secure authentication
      // 4. Process payment
      // 5. Return transaction details
      
      const transactionId = `TXN${Date.now()}`
      const maskedCard = {
        last4: data.cardNumber.slice(-4),
        type: cardType,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear
      }
      
      onPaymentComplete(transactionId, maskedCard)
      
      toast({
        title: "Payment Successful",
        description: `Payment of ₹${amount.toFixed(2)} has been processed successfully.`,
      })
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process card payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Credit/Debit Card
          </CardTitle>
          <CardDescription>
            Pay ₹{amount.toFixed(2)} securely with your card
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Card Number */}
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'cardNumber'> }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value)
                            field.onChange(formatted)
                            setCardType(detectCardType(formatted))
                          }}
                          className="pr-12"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {cardType && (
                            <Badge variant="outline" className="text-xs">
                              {cardType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cardholder Name */}
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'cardholderName'> }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'expiryMonth'> }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'expiryYear'> }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'cvv'> }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showCVV ? 'text' : 'password'}
                            placeholder="123"
                            maxLength={4}
                            className="pr-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2"
                            onClick={() => setShowCVV(!showCVV)}
                          >
                            {showCVV ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Save Card Option */}
              <FormField
                control={form.control}
                name="saveCard"
                render={({ field }: { field: ControllerRenderProps<CreditCardForm, 'saveCard'> }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Save this card for future payments
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Your card details will be encrypted and stored securely
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Security Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pay ₹{amount.toFixed(2)}
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onPaymentCancel}
            disabled={isProcessing}
          >
            Cancel Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
