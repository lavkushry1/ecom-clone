'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/ecommerce/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [searchTerm, setSearchTerm] = useState(searchParam || '');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100000,
  });
  const [showFilters, setShowFilters] = useState(false);

  const {
    products,
    categories,
    loading,
    error,
    hasMore,
    fetchMoreProducts,
    searchProducts,
    refetch,
  } = useProducts({
    category: categoryParam || undefined,
    searchTerm: searchParam || undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 100000 ? priceRange.max : undefined,
    limitCount: 20,
  });

  // Handle search
  const handleSearch = useCallback(async (term: string) => {
    if (term.trim()) {
      await searchProducts(term.trim());
    } else {
      await refetch();
    }
  }, [searchProducts, refetch]);

  // Handle search input submit
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  }, [handleSearch, searchTerm]);

  // Get current category name
  const currentCategory = categories.find(cat => cat.id === categoryParam);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          {currentCategory && (
            <p className="text-gray-600">{currentCategory.description}</p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="px-6">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange(prev => ({
                            ...prev,
                            min: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange(prev => ({
                            ...prev,
                            max: Number(e.target.value) || 100000,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={!categoryParam ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          url.searchParams.delete('category');
                          window.history.pushState({}, '', url.toString());
                          refetch();
                        }
                      }}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={categoryParam === category.id ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            const url = new URL(window.location.href);
                            url.searchParams.set('category', category.id);
                            window.history.pushState({}, '', url.toString());
                            refetch();
                          }
                        }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Apply Filters */}
                <Button
                  onClick={() => {
                    refetch();
                    setShowFilters(false);
                  }}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Button onClick={refetch} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !loading && (
              <div className="text-center">
                <Button
                  onClick={fetchMoreProducts}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Load More Products
                </Button>
              </div>
            )}

            {/* Loading State for Load More */}
            {loading && products.length > 0 && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flipkart-blue mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading more products...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
