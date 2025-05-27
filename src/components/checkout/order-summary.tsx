'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Tag, Truck, Shield, CreditCard, Percent } from 'lucide-react'
import { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal?: number
  shipping?: number
  tax?: number
  discount?: number
  couponCode?: string
  showItemDetails?: boolean
  showPriceBreakdown?: boolean
  onApplyCoupon?: (code: string) => void
  onRemoveCoupon?: () => void
  className?: string
}

interface PriceBreakdown {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  savings: number
}

export function OrderSummary({
  items,
  subtotal,
  shipping = 0,
  tax,
  discount = 0,
  couponCode,
  showItemDetails = true,
  showPriceBreakdown = true,
  onApplyCoupon,
  onRemoveCoupon,
  className = ''
}: OrderSummaryProps) {
  
  // Calculate price breakdown
  const priceBreakdown: PriceBreakdown = useMemo(() => {
    const calculatedSubtotal = subtotal || items.reduce(
      (sum, item) => sum + (item.product.salePrice * item.quantity), 0
    )
    
    const originalTotal = items.reduce(
      (sum, item) => sum + (item.product.originalPrice * item.quantity), 0
    )
    
    const calculatedTax = tax || Math.round(calculatedSubtotal * 0.18) // 18% GST
    const calculatedShipping = calculatedSubtotal >= 500 ? 0 : shipping || 40
    
    const total = calculatedSubtotal + calculatedShipping + calculatedTax - discount
    const savings = originalTotal - calculatedSubtotal + discount
    
    return {
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      discount,
      total,
      savings
    }
  }, [items, subtotal, shipping, tax, discount])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className={`sticky top-4 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
          <Badge variant="secondary" className="ml-auto">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Items List */}
        {showItemDetails && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
              Items in your cart
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} 
                     className="flex gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                    <Image
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium line-clamp-2">
                      {item.product.name}
                    </h5>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {item.selectedSize && (
                        <Badge variant="outline" className="text-xs">
                          Size: {item.selectedSize}
                        </Badge>
                      )}
                      {item.selectedColor && (
                        <Badge variant="outline" className="text-xs">
                          Color: {item.selectedColor}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          ₹{(item.product.salePrice * item.quantity).toLocaleString()}
                        </span>
                        {item.product.originalPrice > item.product.salePrice && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Coupon Section */}
        {onApplyCoupon && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
              Promo Code
            </h4>
            {couponCode ? (
              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {couponCode}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Applied
                  </Badge>
                </div>
                {onRemoveCoupon && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveCoupon}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onApplyCoupon('')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Apply Coupon
              </Button>
            )}
            <Separator />
          </div>
        )}

        {/* Price Breakdown */}
        {showPriceBreakdown && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
              Price Details
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{priceBreakdown.subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Delivery Fee
                </span>
                <span className={priceBreakdown.shipping === 0 ? 'text-green-600' : ''}>
                  {priceBreakdown.shipping === 0 ? 'FREE' : `₹${priceBreakdown.shipping}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Taxes & Fees
                </span>
                <span>₹{priceBreakdown.tax.toLocaleString()}</span>
              </div>
              
              {priceBreakdown.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Discount Applied
                  </span>
                  <span>-₹{priceBreakdown.discount.toLocaleString()}</span>
                </div>
              )}
              
              {priceBreakdown.savings > 0 && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>Total Savings</span>
                  <span>₹{priceBreakdown.savings.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>₹{priceBreakdown.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Free Delivery</p>
              <p className="text-blue-600">
                {priceBreakdown.subtotal >= 500 
                  ? 'You qualify for free delivery!' 
                  : `Add ₹${(500 - priceBreakdown.subtotal).toLocaleString()} more for free delivery`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Secure Checkout</p>
              <p className="text-green-600">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="w-full text-center text-xs text-gray-500">
          By placing your order, you agree to our Terms & Conditions
        </div>
      </CardFooter>
    </Card>
  )
}
