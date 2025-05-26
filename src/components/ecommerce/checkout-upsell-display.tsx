'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types';

interface UpsellProduct extends Product {
  originalPrice: number;
  upsellDiscount: number;
  estimatedSavings: number;
  bundleOffer?: string;
}

interface CheckoutUpsellDisplayProps {
  cartProducts: Product[];
  onAddToCart?: (product: Product) => void;
}

export function CheckoutUpsellDisplay({ cartProducts, onAddToCart }: CheckoutUpsellDisplayProps) {
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();

  // Generate smart upsell recommendations based on cart contents
  useEffect(() => {
    const generateUpsells = () => {
      const mockUpsells: UpsellProduct[] = [
        {
          id: 'upsell-1',
          name: 'Extended Warranty Protection',
          price: 299,
          originalPrice: 499,
          upsellDiscount: 40,
          estimatedSavings: 200,
          image: '/images/products/warranty.jpg',
          category: 'Protection',
          rating: 4.8,
          reviewCount: 1250,
          description: '2-year extended warranty covering all damages',
          bundleOffer: 'Only available during checkout'
        },
        {
          id: 'upsell-2', 
          name: 'Premium Gift Wrapping',
          price: 99,
          originalPrice: 199,
          upsellDiscount: 50,
          estimatedSavings: 100,
          image: '/images/products/gift-wrap.jpg',
          category: 'Service',
          rating: 4.9,
          reviewCount: 890,
          description: 'Beautiful gift wrapping with personalized message',
          bundleOffer: 'Perfect for special occasions'
        },
        {
          id: 'upsell-3',
          name: 'Express Delivery (Same Day)',
          price: 149,
          originalPrice: 299,
          upsellDiscount: 50,
          estimatedSavings: 150,
          image: '/images/products/express-delivery.jpg',
          category: 'Delivery',
          rating: 4.7,
          reviewCount: 2100,
          description: 'Get your order delivered within 4 hours',
          bundleOffer: 'Limited time offer'
        }
      ];

      // Filter based on cart context
      const relevantUpsells = mockUpsells.filter((upsell, index) => {
        // Show different upsells based on cart value or product types
        const cartValue = cartProducts.reduce((sum, product) => sum + product.price, 0);
        if (cartValue > 1000 && index === 0) return true; // Warranty for expensive items
        if (cartProducts.length > 2 && index === 1) return true; // Gift wrapping for multiple items
        if (cartValue > 500 && index === 2) return true; // Express delivery for valuable orders
        return false;
      });

      setUpsellProducts(relevantUpsells);
    };

    generateUpsells();
  }, [cartProducts]);

  const handleToggleUpsell = (productId: string) => {
    const newSelected = new Set(selectedUpsells);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
      
      // Add to cart
      const product = upsellProducts.find(p => p.id === productId);
      if (product && onAddToCart) {
        onAddToCart(product);
      } else if (product) {
        addToCart(product, 1);
      }
    }
    setSelectedUpsells(newSelected);
  };

  const totalSavings = upsellProducts
    .filter(product => selectedUpsells.has(product.id))
    .reduce((sum, product) => sum + product.estimatedSavings, 0);

  if (upsellProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Add-ons
            </h3>
            <p className="text-sm text-gray-600">
              Complete your order with these popular choices
            </p>
          </div>
          {selectedUpsells.size > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Saving ₹{totalSavings}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {upsellProducts.map((product) => {
            const isSelected = selectedUpsells.has(product.id);
            
            return (
              <div
                key={product.id}
                className={`relative border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleToggleUpsell(product.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {product.category === 'Protection' && '🛡️'}
                        {product.category === 'Service' && '🎁'}
                        {product.category === 'Delivery' && '🚚'}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.description}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {product.rating} ({product.reviewCount} reviews)
                          </span>
                        </div>

                        {/* Bundle Offer */}
                        {product.bundleOffer && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                            {product.bundleOffer}
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            ₹{product.price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {product.upsellDiscount}% OFF
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Button */}
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`absolute bottom-4 right-4 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleUpsell(product.id);
                  }}
                >
                  {isSelected ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {selectedUpsells.size > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {selectedUpsells.size} add-on{selectedUpsells.size > 1 ? 's' : ''} selected
              </span>
              <span className="font-medium text-green-600">
                Total savings: ₹{totalSavings}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
