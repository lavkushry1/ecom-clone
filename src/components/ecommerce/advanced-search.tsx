'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  X, 
  Filter, 
  Star, 
  Tag,
  Clock,
  TrendingUp,
  ChevronDown,
  History,
  MapPin
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  brand?: string[];
  rating?: number;
  availability?: 'in-stock' | 'out-of-stock' | 'all';
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
  tags?: string[];
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'search-term';
  count?: number;
  image?: string;
}

interface AdvancedSearchProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onSearch: (query: string, filters: SearchFilters) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  categories?: Array<{ id: string; name: string; count: number }>;
  brands?: Array<{ id: string; name: string; count: number }>;
  priceRange?: [number, number];
  className?: string;
  showFilters?: boolean;
  placeholder?: string;
}

export function AdvancedSearch({
  initialQuery = '',
  initialFilters = {},
  onSearch,
  onFilterChange,
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  categories = [],
  brands = [],
  priceRange = [0, 200000],
  className = '',
  showFilters = true,
  placeholder = 'Search products, brands, categories...'
}: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Sample data for demonstration
  const defaultSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'iPhone 15 Pro Max', type: 'product', count: 234, image: '/api/placeholder/40/40' },
    { id: '2', text: 'Samsung Galaxy S24', type: 'product', count: 189, image: '/api/placeholder/40/40' },
    { id: '3', text: 'Electronics', type: 'category', count: 1567 },
    { id: '4', text: 'Apple', type: 'brand', count: 892 },
    { id: '5', text: 'wireless headphones', type: 'search-term', count: 445 },
  ];

  const defaultCategories = [
    { id: 'electronics', name: 'Electronics', count: 1567 },
    { id: 'fashion', name: 'Fashion', count: 892 },
    { id: 'home', name: 'Home & Kitchen', count: 445 },
    { id: 'books', name: 'Books', count: 234 },
    { id: 'sports', name: 'Sports & Outdoors', count: 189 },
  ];

  const defaultBrands = [
    { id: 'apple', name: 'Apple', count: 234 },
    { id: 'samsung', name: 'Samsung', count: 189 },
    { id: 'sony', name: 'Sony', count: 156 },
    { id: 'lg', name: 'LG', count: 134 },
    { id: 'xiaomi', name: 'Xiaomi', count: 98 },
  ];

  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialQuery) {
      handleSearch();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    onSearch(query, filters);
    setShowSuggestions(false);
    
    // Add to recent searches (in a real app, this would be stored in localStorage)
    if (query.trim()) {
      // addToRecentSearches(query);
    }
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
    handleSearch();
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
    handleSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange && (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1])) count++;
    if (filters.brand && filters.brand.length > 0) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.availability && filters.availability !== 'all') count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  };

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;
  const activeCategories = categories.length > 0 ? categories : defaultCategories;
  const activeBrands = brands.length > 0 ? brands : defaultBrands;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="pl-10 pr-20"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setQuery('');
                searchInputRef.current?.focus();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (query || recentSearches.length > 0 || popularSearches.length > 0) && (
          <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
            <CardContent className="p-0">
              {/* Suggestions based on query */}
              {query && activeSuggestions.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h4>
                  <div className="space-y-1">
                    {activeSuggestions
                      .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
                      .slice(0, 5)
                      .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.image ? (
                            <img src={suggestion.image} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              {suggestion.type === 'product' && <Tag className="h-4 w-4" />}
                              {suggestion.type === 'category' && <Filter className="h-4 w-4" />}
                              {suggestion.type === 'brand' && <Star className="h-4 w-4" />}
                              {suggestion.type === 'search-term' && <TrendingUp className="h-4 w-4" />}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-sm">{suggestion.text}</div>
                            {suggestion.count && (
                              <div className="text-xs text-muted-foreground">
                                {suggestion.count.toLocaleString()} results
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <History className="h-3 w-3 mr-1" />
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => setQuery(search)}
                      >
                        <span className="text-sm">{search}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!query && popularSearches.length > 0 && (
                <div className="p-3 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {popularSearches.slice(0, 8).map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setQuery(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters Toggle */}
      {showFilters && (
        <div className="flex items-center justify-between mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="default" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
          </Button>

          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <Card className="mt-3">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Category</h4>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange({ category: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange || priceRange}
                    onValueChange={(value) => handleFilterChange({ priceRange: value as [number, number] })}
                    max={priceRange[1]}
                    min={priceRange[0]}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>₹{(filters.priceRange?.[0] || priceRange[0]).toLocaleString()}</span>
                    <span>₹{(filters.priceRange?.[1] || priceRange[1]).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={filters.rating === rating}
                        onCheckedChange={(checked) => 
                          handleFilterChange({ rating: checked ? rating : undefined })
                        }
                      />
                      <label htmlFor={`rating-${rating}`} className="flex items-center space-x-1 text-sm">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>& above</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Brand</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeBrands.map((brand) => (
                    <div key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={filters.brand?.includes(brand.id) || false}
                        onCheckedChange={(checked) => {
                          const currentBrands = filters.brand || [];
                          const newBrands = checked
                            ? [...currentBrands, brand.id]
                            : currentBrands.filter(b => b !== brand.id);
                          handleFilterChange({ brand: newBrands.length > 0 ? newBrands : undefined });
                        }}
                      />
                      <label htmlFor={`brand-${brand.id}`} className="text-sm flex-1">
                        {brand.name} ({brand.count})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Availability</h4>
                <Select
                  value={filters.availability || 'all'}
                  onValueChange={(value) => handleFilterChange({ availability: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All items</SelectItem>
                    <SelectItem value="in-stock">In stock only</SelectItem>
                    <SelectItem value="out-of-stock">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h4 className="font-medium">Sort By</h4>
                <Select
                  value={filters.sortBy || 'relevance'}
                  onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Category: {activeCategories.find(c => c.id === filters.category)?.name}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange({ category: undefined })}
              />
            </Badge>
          )}
          
          {filters.priceRange && (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange({ priceRange: undefined })}
              />
            </Badge>
          )}

          {filters.brand && filters.brand.map((brandId) => (
            <Badge key={brandId} variant="secondary" className="flex items-center space-x-1">
              <span>{activeBrands.find(b => b.id === brandId)?.name}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange({ 
                  brand: filters.brand?.filter(b => b !== brandId) 
                })}
              />
            </Badge>
          ))}

          {filters.rating && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.rating}+ stars</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange({ rating: undefined })}
              />
            </Badge>
          )}

          {filters.availability && filters.availability !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.availability === 'in-stock' ? 'In stock' : 'Out of stock'}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange({ availability: 'all' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
