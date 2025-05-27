'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { X, Star, Package, Tag, Percent } from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  rating: number;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  discount: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  className?: string;
}

// Mock data for brands - in real app, this would come from API
const AVAILABLE_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme',
  'Vivo', 'Oppo', 'Google', 'Nothing', 'iQOO'
];

const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
  { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: 500000 },
];

const DISCOUNT_OPTIONS = [
  { label: '10% or more', value: 10 },
  { label: '25% or more', value: 25 },
  { label: '50% or more', value: 50 },
  { label: '70% or more', value: 70 },
];

export function ProductFilters({ 
  filters, 
  onFilterChange, 
  onClose,
  className = '' 
}: ProductFiltersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFilterChange({ ...filters, priceRange: range });
  };

  const handleBrandToggle = (brand: string) => {
    const updatedBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updatedBrands });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, rating });
  };

  const handleAvailabilityChange = (availability: 'all' | 'in-stock' | 'out-of-stock') => {
    onFilterChange({ ...filters, availability });
  };

  const handleDiscountChange = (discount: number) => {
    onFilterChange({ ...filters, discount });
  };

  const clearAllFilters = () => {
    onFilterChange({
      priceRange: [0, 500000],
      brands: [],
      rating: 0,
      availability: 'all',
      discount: 0
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) count++;
    if (filters.brands.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.availability !== 'all') count++;
    if (filters.discount > 0) count++;
    return count;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={500000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handlePriceRangeChange([range.min, range.max])}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Brands
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-40 overflow-y-auto space-y-3">
            {AVAILABLE_BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
          
          {filters.brands.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t">
              {filters.brands.map((brand) => (
                <Badge
                  key={brand}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => handleBrandToggle(brand)}
                >
                  {brand}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            Customer Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filters.rating === rating ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs h-8"
              onClick={() => handleRatingChange(rating)}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))}
                <span className="ml-1">& up</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { value: 'all', label: 'All Products' },
            { value: 'in-stock', label: 'In Stock' },
            { value: 'out-of-stock', label: 'Out of Stock' }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`availability-${option.value}`}
                checked={filters.availability === option.value}
                onCheckedChange={() => handleAvailabilityChange(option.value as any)}
              />
              <Label
                htmlFor={`availability-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Discount */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Discount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DISCOUNT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filters.discount === option.value ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs h-8"
              onClick={() => handleDiscountChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Apply Filters Button (Mobile) */}
      <div className="md:hidden">
        <Button onClick={onClose} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
