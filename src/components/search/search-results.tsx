'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Search,
  Filter,
  Star,
  Heart,
  ShoppingCart,
  Grid,
  List,
  TrendingUp,
  Clock,
  Package,
  ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

interface SearchResultsProps {
  query: string;
  category?: string;
  filters?: {
    priceRange: [number, number];
    brands: string[];
    rating: number;
    availability: 'all' | 'in-stock' | 'out-of-stock';
    discount: number;
  };
  onFiltersChange?: (filters: any) => void;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand';
  count?: number;
}

export function SearchResults({
  query,
  category,
  filters,
  onFiltersChange,
  className = ''
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  
  const {
    products,
    loading,
    error,
    searchProducts
  } = useProducts({
    category,
    searchTerm: query,
    minPrice: filters?.priceRange[0],
    maxPrice: filters?.priceRange[1],
    limitCount: 20
  });

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const generateSearchSuggestions = useCallback((searchQuery: string) => {
    // Mock suggestions - in real app, this would come from API
    const suggestions: SearchSuggestion[] = [
      { id: '1', text: `${searchQuery} case`, type: 'product', count: 150 },
      { id: '2', text: `${searchQuery} charger`, type: 'product', count: 89 },
      { id: '3', text: `wireless ${searchQuery}`, type: 'product', count: 67 },
      { id: '4', text: `${searchQuery} accessories`, type: 'category', count: 234 },
      { id: '5', text: `premium ${searchQuery}`, type: 'product', count: 45 }
    ];
    setSearchSuggestions(suggestions);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
      generateSearchSuggestions(query);
    }
  }, [query, searchProducts, generateSearchSuggestions]);

  const handleAddToCart = useCallback((product: Product) => {
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
  }, [addItem, toast]);

  const handleWishlistToggle = useCallback((product: Product) => {
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
  }, [isInWishlist, removeFromWishlist, addToWishlist, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = (salePrice: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!query.trim()) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Start your search
        </h3>
        <p className="text-gray-500">
          Enter a product name, brand, or category to find what you&apos;re looking for
        </p>
      </div>
    );
  }

  if (loading) {
    return <SearchResultsSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Search failed
        </h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => searchProducts(query)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Info & Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Search results for &quot;{query}&quot;
          </h2>
          <p className="text-gray-600">
            Found {products.length} product{products.length !== 1 ? 's' : ''}
            {category && ` in ${category}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="newest">Newest First</option>
            <option value="popularity">Popularity</option>
          </select>

          <div className="flex border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      {searchSuggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Related searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={`/search?q=${encodeURIComponent(suggestion.text)}`}
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    {suggestion.text}
                    {suggestion.count && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({suggestion.count})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search terms or browse our categories
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Suggestions:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your spelling</li>
              <li>• Try more general terms</li>
              <li>• Browse by category</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {products.map((product) => (
            viewMode === 'grid' ? (
              <SearchProductCard
                key={product.id}
                product={product}
                searchTerm={query}
                onAddToCart={handleAddToCart}
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={isInWishlist(product.id)}
                formatPrice={formatPrice}
                getDiscountPercentage={getDiscountPercentage}
                highlightSearchTerm={highlightSearchTerm}
              />
            ) : (
              <SearchProductListItem
                key={product.id}
                product={product}
                searchTerm={query}
                onAddToCart={handleAddToCart}
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={isInWishlist(product.id)}
                formatPrice={formatPrice}
                getDiscountPercentage={getDiscountPercentage}
                highlightSearchTerm={highlightSearchTerm}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card for Grid View
interface SearchProductCardProps {
  product: Product;
  searchTerm: string;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: boolean;
  formatPrice: (price: number) => string;
  getDiscountPercentage: (salePrice: number, originalPrice: number) => number;
  highlightSearchTerm: (text: string, searchTerm: string) => React.ReactNode;
}

function SearchProductCard({
  product,
  searchTerm,
  onAddToCart,
  onWishlistToggle,
  isInWishlist,
  formatPrice,
  getDiscountPercentage,
  highlightSearchTerm
}: SearchProductCardProps) {
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
              {highlightSearchTerm(product.name, searchTerm)}
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
        </div>
      </CardContent>
    </Card>
  );
}

// Product List Item for List View
function SearchProductListItem({
  product,
  searchTerm,
  onAddToCart,
  onWishlistToggle,
  isInWishlist,
  formatPrice,
  getDiscountPercentage,
  highlightSearchTerm
}: SearchProductCardProps) {
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
                    {highlightSearchTerm(product.name, searchTerm)}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600 ml-1">{product.ratings.average}</span>
                  </div>
                  <span className="text-xs text-gray-400">({product.ratings.count || 0} reviews)</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {highlightSearchTerm(product.description, searchTerm)}
                </p>
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
function SearchResultsSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
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
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
