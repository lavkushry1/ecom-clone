import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAddToCartToast } from '@/components/ecommerce/add-to-cart-provider'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  isInWishlist?: boolean
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  isInWishlist = false 
}: ProductCardProps) {
  const discount = calculateDiscount(product.originalPrice, product.salePrice)
  const { showToast } = useAddToCartToast()

  const handleAddToCart = () => {
    onAddToCart?.(product.id)
    showToast({
      id: product.id,
      name: product.name,
      image: product.images[0] || '/placeholder-product.jpg',
      price: product.salePrice,
      quantity: 1
    })
  }
  
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => onAddToWishlist?.(product.id)}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {discount}% OFF
          </div>
        )}
        
        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.brand}
          </p>
          
          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:text-flipkart-blue transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">
                {product.ratings.average.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              ({product.ratings.count})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {formatPrice(product.salePrice)}
            </span>
            {product.originalPrice > product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <Button
            className="w-full mt-3"
            variant="flipkart"
            size="sm"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
