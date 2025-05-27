'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Loader2,
  SortAsc,
  X,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from './product-card'
import { ProductFiltersComponent } from './product-filters'
import type { Product, ProductFilters, Category } from '@/types'

interface SearchResultsDisplayProps {
  searchTerm: string
  results: Product[]
  totalResults: number
  isLoading?: boolean
  error?: string | null
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onLoadMore?: () => void
  hasMore?: boolean
  categories?: Category[]
  brands?: string[]
  className?: string
}

type ViewMode = 'grid' | 'list'

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

export function SearchResultsDisplay({
  searchTerm,
  results,
  totalResults,
  isLoading = false,
  error = null,
  filters,
  onFiltersChange,
  onLoadMore,
  hasMore = false,
  categories = [],
  brands = [],
  className
}: SearchResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Extract unique brands from results for filtering
  const availableBrands = useMemo(() => {
    const resultBrands = Array.from(new Set(results.map(product => product.brand)))
    return brands.length > 0 ? brands : resultBrands
  }, [results, brands])

  const clearSearch = () => {
    onFiltersChange({})
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any })
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Search Error</h3>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">
                {searchTerm ? `Search results for "${searchTerm}"` : 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} products found`}
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {/* Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>

            {/* Sort */}
            <Select
              value={filters.sortBy || 'relevance'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={cn(
          "w-72 flex-shrink-0 space-y-6",
          showFilters ? "block" : "hidden lg:block"
        )}>
          <ProductFiltersComponent
            filters={filters}
            onFiltersChange={onFiltersChange}
            categories={categories}
            brands={availableBrands}
            isLoading={isLoading}
            totalProducts={totalResults}
          />
        </div>

        {/* Results Area */}
        <div className="flex-1 min-w-0">
          {isLoading && results.length === 0 ? (
            // Initial Loading
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Searching products...</p>
                </div>
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            // No Results
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm 
                    ? `No products found for "${searchTerm}". Try adjusting your search terms or filters.`
                    : 'No products match your current filters. Try clearing some filters.'
                  }
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Results Grid/List
            <div className="space-y-6">
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              )}>
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === 'list' ? 'flex-row' : ''}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={onLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More Products'
                    )}
                  </Button>
                </div>
              )}

              {/* Results Footer */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                Showing {results.length} of {totalResults.toLocaleString()} products
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
