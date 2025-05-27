'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ecommerce/product-card'
import { ProductFilters as ProductFiltersComponent } from '@/components/ecommerce/product-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutGrid, 
  List, 
  Search,
  Filter,
  SortAsc,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, ProductFilters, Category } from '@/types'

interface SearchResultsDisplayProps {
  searchTerm: string
  products: Product[]
  categories?: Category[]
  brands?: string[]
  filters: ProductFilters
  isLoading: boolean
  error?: string | null
  totalResults?: number
  onFiltersChange: (filters: ProductFilters) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

export function SearchResultsDisplay({
  searchTerm,
  products,
  categories = [],
  brands = [],
  filters,
  isLoading,
  error,
  totalResults = 0,
  onFiltersChange,
  onLoadMore,
  hasMore = false,
  className
}: SearchResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Reset filters when search term changes
  useEffect(() => {
    if (searchTerm && Object.keys(filters).length > 0) {
      onFiltersChange({})
    }
  }, [searchTerm])

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">No products found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {searchTerm 
          ? `We couldn't find any products matching "${searchTerm}". Try adjusting your search or filters.`
          : 'No products match your current filters. Try adjusting your criteria.'
        }
      </p>
      <Button 
        variant="outline" 
        onClick={() => onFiltersChange({})}
      >
        Clear All Filters
      </Button>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error || 'Failed to load search results. Please try again.'}
      </p>
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  )

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="aspect-square bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.brand && filters.brand.length > 0) count += filters.brand.length
    if (filters.priceRange) count++
    if (filters.rating) count++
    if (filters.inStock) count++
    return count
  }

  if (error) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        {renderErrorState()}
      </div>
    )
  }

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
        </h1>
        <p className="text-muted-foreground">
          {isLoading ? 'Searching...' : `${totalResults} products found`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={cn(
          "lg:w-64 space-y-6",
          !showFilters && "hidden lg:block"
        )}>
          <ProductFiltersComponent
            filters={filters}
            onFilterChange={onFiltersChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {products.length} of {totalResults} results
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 items-center p-4 bg-primary/5 rounded-lg">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.category && (
                <Badge variant="secondary">
                  Category: {filters.category}
                </Badge>
              )}
              {filters.brand?.map((brand) => (
                <Badge key={brand} variant="secondary">
                  {brand}
                </Badge>
              ))}
              {filters.priceRange && (
                <Badge variant="secondary">
                  ₹{filters.priceRange.min.toLocaleString()} - ₹{filters.priceRange.max.toLocaleString()}
                </Badge>
              )}
              {filters.rating && (
                <Badge variant="secondary">
                  {filters.rating}★ & above
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary">
                  In Stock
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({})}
                className="text-red-600 hover:text-red-700 h-auto p-1"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Products Grid/List */}
          {isLoading && products.length === 0 ? (
            renderLoadingState()
          ) : products.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              )}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={onLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Loading...' : 'Load More Products'}
                  </Button>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && products.length > 0 && (
                <div className="text-center pt-8">
                  <Separator className="mb-4" />
                  <p className="text-muted-foreground">
                    You&apos;ve seen all {totalResults} products
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
