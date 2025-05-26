import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface CartItemComponentProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemComponent({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: CartItemComponentProps) {
  const { product, quantity } = item
  const itemTotal = product.salePrice * quantity

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {product.brand}
            </p>
            
            {/* Price */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg font-semibold">
                {formatPrice(product.salePrice)}
              </span>
              {product.originalPrice > product.salePrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* Quantity and Actions */}
          <div className="flex flex-col items-end space-y-2">
            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(product.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            {/* Quantity Controls */}
            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Item Total */}
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatPrice(itemTotal)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Stock Warning */}
        {product.stock <= 5 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              Only {product.stock} left in stock
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
