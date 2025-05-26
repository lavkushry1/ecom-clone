'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  ArrowRight,
  ShoppingCart,
  Heart,
  TrendingUp,
  Eye,
  Zap,
  Award,
  Clock,
  Users,
  Filter,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  brand: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  inStock: boolean;
  description?: string;
  tags?: string[];
}

interface RecommendationReason {
  type: 'viewed-together' | 'bought-together' | 'similar' | 'trending' | 'personalized' | 'new-arrivals' | 'price-match';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: number;
}

interface ProductRecommendationsProps {
  currentProductId?: string;
  userId?: string;
  recommendations?: Product[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  itemsPerRow?: number;
  showReason?: boolean;
  recommendationType?: 'similar' | 'related' | 'trending' | 'personalized' | 'cross-sell' | 'upsell';
  className?: string;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const RECOMMENDATION_TYPES: Record<string, RecommendationReason> = {
  'viewed-together': {
    type: 'viewed-together',
    title: 'Frequently Viewed Together',
    description: 'Customers who viewed this item also viewed',
    icon: <Eye className="h-4 w-4" />,
    priority: 1
  },
  'bought-together': {
    type: 'bought-together',
    title: 'Frequently Bought Together',
    description: 'Customers who bought this item also bought',
    icon: <ShoppingCart className="h-4 w-4" />,
    priority: 2
  },
  similar: {
    type: 'similar',
    title: 'Similar Products',
    description: 'Products similar to what you\'re viewing',
    icon: <Filter className="h-4 w-4" />,
    priority: 3
  },
  trending: {
    type: 'trending',
    title: 'Trending Now',
    description: 'Popular products customers are buying',
    icon: <TrendingUp className="h-4 w-4" />,
    priority: 4
  },
  personalized: {
    type: 'personalized',
    title: 'Recommended for You',
    description: 'Based on your browsing and purchase history',
    icon: <Award className="h-4 w-4" />,
    priority: 5
  },
  'new-arrivals': {
    type: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Latest products in this category',
    icon: <Zap className="h-4 w-4" />,
    priority: 6
  },
  'price-match': {
    type: 'price-match',
    title: 'Similar Price Range',
    description: 'Products in a similar price range',
    icon: <RefreshCw className="h-4 w-4" />,
    priority: 7
  }
};

// Mock data for demonstration
const mockRecommendations: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    rating: 4.5,
    reviewCount: 2456,
    image: '/api/placeholder/300/300',
    category: 'Electronics',
    brand: 'TechPro',
    isBestSeller: true,
    inStock: true,
    description: 'High-quality wireless headphones with noise cancellation',
    tags: ['wireless', 'noise-cancellation', 'premium']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    rating: 4.3,
    reviewCount: 1834,
    image: '/api/placeholder/300/300',
    category: 'Wearables',
    brand: 'FitTech',
    isNew: true,
    inStock: true,
    description: 'Track your fitness goals with this smart watch',
    tags: ['fitness', 'smart', 'waterproof']
  },
  {
    id: '3',
    name: 'Portable Bluetooth Speaker',
    price: 3999,
    originalPrice: 5999,
    discount: 33,
    rating: 4.7,
    reviewCount: 987,
    image: '/api/placeholder/300/300',
    category: 'Audio',
    brand: 'SoundMax',
    isOnSale: true,
    inStock: true,
    description: 'Compact speaker with powerful bass',
    tags: ['portable', 'bluetooth', 'bass']
  },
  {
    id: '4',
    name: 'Gaming Mechanical Keyboard',
    price: 7499,
    rating: 4.6,
    reviewCount: 654,
    image: '/api/placeholder/300/300',
    category: 'Gaming',
    brand: 'GamePro',
    inStock: true,
    description: 'RGB mechanical keyboard for gaming',
    tags: ['gaming', 'mechanical', 'rgb']
  }
];

export function ProductRecommendations({
  currentProductId,
  userId,
  recommendations = mockRecommendations,
  loading = false,
  title,
  subtitle,
  maxItems = 8,
  itemsPerRow = 4,
  showReason = true,
  recommendationType = 'similar',
  className = '',
  onProductClick,
  onAddToCart,
  onAddToWishlist
}: ProductRecommendationsProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerRow);
  const [currentReason, setCurrentReason] = useState<RecommendationReason>(
    RECOMMENDATION_TYPES[recommendationType]
  );

  const displayedRecommendations = recommendations.slice(0, Math.min(maxItems, visibleItems));

  useEffect(() => {
    if (recommendationType in RECOMMENDATION_TYPES) {
      setCurrentReason(RECOMMENDATION_TYPES[recommendationType]);
    }
  }, [recommendationType]);

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + itemsPerRow, maxItems));
  };

  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Zap className="h-3 w-3 mr-1" />
                New
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-orange-500 hover:bg-orange-600">
                <Award className="h-3 w-3 mr-1" />
                Bestseller
              </Badge>
            )}
            {product.discount && (
              <Badge variant="destructive">
                {product.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist?.(product);
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-black">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.discount && (
              <p className="text-sm text-green-600">
                You save ₹{((product.originalPrice || 0) - product.price).toLocaleString()}
              </p>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            size="sm"
            className="w-full"
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingSkeleton = () => (
    <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(itemsPerRow, 4)} gap-4`}>
      {Array.from({ length: itemsPerRow }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-0">
            <Skeleton className="aspect-square rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {showReason && currentReason.icon}
            <h2 className="text-xl font-semibold">
              {title || currentReason.title}
            </h2>
          </div>
          {showReason && (
            <p className="text-sm text-gray-600">
              {subtitle || currentReason.description}
            </p>
          )}
        </div>

        {/* View All Link */}
        {recommendations.length > maxItems && (
          <Link href="/products" className="text-blue-600 hover:text-blue-800 transition-colors">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(itemsPerRow, 4)} gap-4`}>
        {displayedRecommendations.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            onClick={() => onProductClick?.(product)}
          >
            {renderProductCard(product)}
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {visibleItems < Math.min(recommendations.length, maxItems) && (
        <div className="text-center">
          <Button variant="outline" onClick={loadMore} className="flex items-center space-x-2">
            <span>Show More Products</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Statistics */}
      {showReason && recommendations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Recommended</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendations.reduce((acc, p) => acc + p.rating, 0) / recommendations.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {recommendations.filter(p => p.discount).length}
              </div>
              <div className="text-sm text-gray-600">On Sale</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {recommendations.filter(p => p.inStock).length}
              </div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
