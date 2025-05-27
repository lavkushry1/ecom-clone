'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import {
  Heart,
  ShoppingCart,
  Star,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Eye,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { ProductFilters } from './product-filters';

interface ProductGridProps {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

export function ProductGrid({
  categoryId,
  searchQuery,
  limit,
  showFilters = true,
  viewMode = 'grid',
  onViewModeChange,
  className = ''
}: ProductGridProps) {
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    priceRange: [0, 500000] as [number, number],
    brands: [] as string[],
    rating: 0,
    availability: 'all' as 'all' | 'in-stock' | 'out-of-stock',
    discount: 0
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const { 
    products, 
    loading, 
    error, 
    hasMore, 
    fetchProducts,
    fetchMoreProducts
  } = useProducts({
    category: categoryId,
    searchTerm: searchQuery,
    limitCount: limit || 20,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1]
  });

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [categoryId, searchQuery, limit, sortBy, filters, fetchProducts]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    addItem(product, 1);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist`,
      });
    } else {
      addToWishlist(product.id);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load products
        </h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => fetchProducts()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="newest">Newest First</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-md">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && showFilterPanel && (
          <div className="w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilterPanel(false)}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton viewMode={currentViewMode} />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button onClick={() => setFilters({
                priceRange: [0, 500000],
                brands: [],
                rating: 0,
                availability: 'all',
                discount: 0
              })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={
                currentViewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {products.map((product) => (
                  currentViewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={isInWishlist(product.id)}
                      formatPrice={formatPrice}
                      getDiscountPercentage={getDiscountPercentage}
                    />
                  ) : (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={isInWishlist(product.id)}
                      formatPrice={formatPrice}
                      getDiscountPercentage={getDiscountPercentage}
                    />
                  )
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={fetchMoreProducts}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <>Loading more products...</>
                    ) : (
                      <>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Load More Products
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Card Component (Grid View)
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: boolean;
  formatPrice: (price: number) => string;
  getDiscountPercentage: (price: number, originalPrice?: number) => number;
}

function ProductCard({ 
  product, 
  onAddToCart, 
  onWishlistToggle, 
  isInWishlist, 
  formatPrice, 
  getDiscountPercentage 
}: ProductCardProps) {
  const discountPercentage = getDiscountPercentage(product.salePrice, product.originalPrice);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.images?.[0] || '/api/placeholder/300/300'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}

        {product.stock === 0 && (
          <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
            Out of Stock
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 ${product.stock === 0 ? 'right-20' : ''} ${
            isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
          onClick={() => onWishlistToggle(product)}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-sm hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">{product.ratings.average}</span>
            </div>
            <span className="text-xs text-gray-400">({product.ratings.count || 0})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPrice(product.salePrice)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Link href={`/products/${product.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Product List Item Component (List View)
function ProductListItem({ 
  product, 
  onAddToCart, 
  onWishlistToggle, 
  isInWishlist, 
  formatPrice, 
  getDiscountPercentage 
}: ProductCardProps) {
  const discountPercentage = getDiscountPercentage(product.salePrice, product.originalPrice);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link href={`/products/${product.id}`} className="flex-shrink-0">
            <img
              src={product.images?.[0] || '/api/placeholder/300/300'}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600 ml-1">{product.ratings.average}</span>
                  </div>
                  <span className="text-xs text-gray-400">({product.ratings.count || 0} reviews)</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{formatPrice(product.salePrice)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWishlistToggle(product)}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function ProductGridSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const items = Array.from({ length: viewMode === 'grid' ? 8 : 4 });

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {items.map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((_, index) => (
        <Card key={index}>
          <Skeleton className="w-full h-48 rounded-t-lg" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
