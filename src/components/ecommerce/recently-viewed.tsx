'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Star, 
  ShoppingCart, 
  Heart,
  Eye,
  Trash2,
  RotateCcw,
  ArrowRight,
  Filter,
  Grid,
  List,
  X,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';

interface ViewedProduct {
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
  inStock: boolean;
  viewedAt: Date;
  viewCount: number;
  description?: string;
  tags?: string[];
  lastSessionViewed?: boolean;
}

interface RecentlyViewedProps {
  userId?: string;
  maxItems?: number;
  className?: string;
  variant?: 'compact' | 'detailed' | 'horizontal';
  showActions?: boolean;
  showTimestamp?: boolean;
  showViewCount?: boolean;
  onProductClick?: (product: ViewedProduct) => void;
  onClearHistory?: () => void;
  title?: string;
  hideTitle?: boolean;
}

export function RecentlyViewed({
  userId,
  maxItems = 12,
  className = '',
  variant = 'detailed',
  showActions = true,
  showTimestamp = true,
  showViewCount = false,
  onProductClick,
  onClearHistory,
  title = 'Recently Viewed',
  hideTitle = false
}: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'price-low' | 'price-high' | 'rating'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  // Load recently viewed products from localStorage
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const products = JSON.parse(storedData).map((p: any) => ({
            ...p,
            viewedAt: new Date(p.viewedAt)
          }));
          setViewedProducts(products);
        } else {
          // Load mock data for demo
          const mockProducts: ViewedProduct[] = [
            {
              id: '1',
              name: 'Premium Wireless Headphones',
              price: 12999,
              originalPrice: 15999,
              discount: 19,
              rating: 4.5,
              reviewCount: 2340,
              image: '/api/placeholder/300/300',
              category: 'Electronics',
              brand: 'TechPro',
              inStock: true,
              viewedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
              viewCount: 3,
              lastSessionViewed: true,
              description: 'High-quality wireless headphones with active noise cancellation',
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
              inStock: true,
              viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              viewCount: 2,
              description: 'Track your fitness goals with advanced health monitoring',
              tags: ['fitness', 'health', 'smartwatch']
            },
            {
              id: '3',
              name: 'Bluetooth Speaker',
              price: 3999,
              originalPrice: 5999,
              discount: 33,
              rating: 4.7,
              reviewCount: 987,
              image: '/api/placeholder/300/300',
              category: 'Audio',
              brand: 'SoundMax',
              inStock: true,
              viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
              viewCount: 1,
              description: 'Portable speaker with deep bass and crystal clear sound',
              tags: ['portable', 'bass', 'waterproof']
            },
            {
              id: '4',
              name: 'Gaming Mechanical Keyboard',
              price: 7499,
              originalPrice: 9999,
              discount: 25,
              rating: 4.6,
              reviewCount: 1456,
              image: '/api/placeholder/300/300',
              category: 'Gaming',
              brand: 'GameTech',
              inStock: false,
              viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              viewCount: 5,
              description: 'RGB mechanical keyboard for professional gaming',
              tags: ['gaming', 'rgb', 'mechanical']
            }
          ];
          setViewedProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentlyViewed();
  }, [userId]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...viewedProducts];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    // Limit to maxItems
    filtered = filtered.slice(0, maxItems);

    setFilteredProducts(filtered);
  }, [viewedProducts, filterCategory, sortBy, maxItems]);

  // Track product view
  const trackProductView = (productId: string, productData: Partial<ViewedProduct>) => {
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    const existingData = localStorage.getItem(storageKey);
    let products: ViewedProduct[] = existingData ? JSON.parse(existingData) : [];

    // Remove existing entry if present
    products = products.filter(p => p.id !== productId);

    // Add new entry at the beginning
    const newProduct: ViewedProduct = {
      id: productId,
      name: productData.name || '',
      price: productData.price || 0,
      originalPrice: productData.originalPrice,
      discount: productData.discount,
      rating: productData.rating || 0,
      reviewCount: productData.reviewCount || 0,
      image: productData.image || '',
      category: productData.category || '',
      brand: productData.brand || '',
      inStock: productData.inStock ?? true,
      viewedAt: new Date(),
      viewCount: (products.find(p => p.id === productId)?.viewCount || 0) + 1,
      description: productData.description,
      tags: productData.tags,
      lastSessionViewed: true
    };

    products.unshift(newProduct);

    // Keep only the last 50 items
    products = products.slice(0, 50);

    // Mark other products as not from current session
    products.forEach((p, index) => {
      if (index > 0) p.lastSessionViewed = false;
    });

    localStorage.setItem(storageKey, JSON.stringify(products));
    setViewedProducts(products);
  };

  const removeProduct = (productId: string) => {
    const updated = viewedProducts.filter(p => p.id !== productId);
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setViewedProducts(updated);
    
    toast({
      title: "Removed from history",
      description: "Product removed from your viewing history",
    });
  };

  const clearAllHistory = () => {
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    localStorage.removeItem(storageKey);
    setViewedProducts([]);
    onClearHistory?.();
    
    toast({
      title: "History cleared",
      description: "All recently viewed products have been removed",
    });
  };

  const handleAddToCart = (product: ViewedProduct) => {
    if (!product.inStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleWishlistToggle = (product: ViewedProduct) => {
    toggleWishlist(product.id);
    const isNowInWishlist = !isInWishlist(product.id);
    
    toast({
      title: isNowInWishlist ? "Added to wishlist" : "Removed from wishlist",
      description: isNowInWishlist 
        ? `${product.name} has been added to your wishlist`
        : `${product.name} has been removed from your wishlist`,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategories = () => {
    const categories = new Set(viewedProducts.map(p => p.category));
    return Array.from(categories);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <Card className={className}>
        {!hideTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products viewed yet
            </h3>
            <p className="text-gray-500 mb-6">
              Products you view will appear here for easy access
            </p>
            <Link href="/products">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderProductCard = (product: ViewedProduct) => {
    const handleProductClick = () => {
      onProductClick?.(product);
    };

    if (variant === 'compact') {
      return (
        <div className="group relative">
          <Link href={`/products/${product.id}`} onClick={handleProductClick}>
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {product.discount && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {product.discount}% OFF
                </Badge>
              )}
              {product.lastSessionViewed && (
                <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
                  Recent
                </Badge>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-600">
                {product.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
          {showTimestamp && (
            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(product.viewedAt)}</p>
          )}
        </div>
      );
    }

    if (variant === 'horizontal') {
      return (
        <Card className="flex items-center p-3 hover:shadow-md transition-shadow">
          <Link href={`/products/${product.id}`} onClick={handleProductClick} className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1 hover:text-blue-600">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {showTimestamp && (
                <p className="text-xs text-gray-500">{formatTimeAgo(product.viewedAt)}</p>
              )}
            </div>
          </Link>
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                className="h-8 w-8 p-0"
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeProduct(product.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </Card>
      );
    }

    // Detailed view (default)
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <div className="relative">
          <Link href={`/products/${product.id}`} onClick={handleProductClick}>
            <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {product.discount && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {product.discount}% OFF
                </Badge>
              )}
              {!product.inStock && (
                <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
                  Out of Stock
                </Badge>
              )}
              {product.lastSessionViewed && (
                <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </Badge>
              )}
            </div>
          </Link>
          
          {showActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeProduct(product.id)}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
            <Link href={`/products/${product.id}`} onClick={handleProductClick}>
              <h3 className="font-medium text-sm hover:text-blue-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
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

            {showTimestamp && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(product.viewedAt)}
                {showViewCount && (
                  <>
                    <span>•</span>
                    <Eye className="h-3 w-3" />
                    <span>{product.viewCount} views</span>
                  </>
                )}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWishlistToggle(product)}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={className}>
      {!hideTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {variant === 'detailed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllHistory}
                disabled={filteredProducts.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && variant === 'detailed' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="recent">Recently Viewed</option>
                <option value="popular">Most Viewed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent>
        {variant === 'horizontal' ? (
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <div key={product.id}>
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`
              : 'space-y-4'
          }>
            {filteredProducts.map(product => (
              <div key={product.id}>
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        {viewedProducts.length > maxItems && (
          <div className="text-center mt-6">
            <Link href="/products/recently-viewed">
              <Button variant="outline" className="flex items-center gap-2">
                <span>View All ({viewedProducts.length})</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for tracking product views
export function useRecentlyViewed(userId?: string) {
  const trackView = (productId: string, productData: Partial<ViewedProduct>) => {
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    const existingData = localStorage.getItem(storageKey);
    let products: ViewedProduct[] = existingData ? JSON.parse(existingData) : [];

    // Remove existing entry if present
    products = products.filter(p => p.id !== productId);

    // Add new entry at the beginning
    const newProduct: ViewedProduct = {
      id: productId,
      name: productData.name || '',
      price: productData.price || 0,
      originalPrice: productData.originalPrice,
      discount: productData.discount,
      rating: productData.rating || 0,
      reviewCount: productData.reviewCount || 0,
      image: productData.image || '',
      category: productData.category || '',
      brand: productData.brand || '',
      inStock: productData.inStock ?? true,
      viewedAt: new Date(),
      viewCount: (products.find(p => p.id === productId)?.viewCount || 0) + 1,
      description: productData.description,
      tags: productData.tags,
      lastSessionViewed: true
    };

    products.unshift(newProduct);

    // Keep only the last 50 items
    products = products.slice(0, 50);

    // Mark other products as not from current session
    products.forEach((p, index) => {
      if (index > 0) p.lastSessionViewed = false;
    });

    localStorage.setItem(storageKey, JSON.stringify(products));
  };

  const getRecentlyViewed = (): ViewedProduct[] => {
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      return JSON.parse(storedData).map((p: any) => ({
        ...p,
        viewedAt: new Date(p.viewedAt)
      }));
    }
    
    return [];
  };

  const clearHistory = () => {
    const storageKey = userId ? `recently-viewed-${userId}` : 'recently-viewed-guest';
    localStorage.removeItem(storageKey);
  };

  return {
    trackView,
    getRecentlyViewed,
    clearHistory
  };
}
