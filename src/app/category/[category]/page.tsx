'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductService, CategoryService } from '@/lib/firebase-services';
import { ProductCard } from '@/components/ecommerce/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const loadCategoryData = useCallback(async () => {
    setLoading(true);
    try {
      // Get category info
      const categoryData = await CategoryService.getCategoryById(categoryId);
      setCategory(categoryData);

      // Get products for this category
      let categoryProducts = await ProductService.getProductsByCategory(categoryId, 50);
      
      // Apply filters
      if (selectedSubcategories.length > 0) {
        categoryProducts = categoryProducts.filter(product => 
          selectedSubcategories.includes(product.subcategory || '')
        );
      }
      
      categoryProducts = categoryProducts.filter(product => {
        const price = product.salePrice || product.originalPrice;
        return price >= priceRange.min && price <= priceRange.max;
      });
      
      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          categoryProducts.sort((a, b) => (a.salePrice || a.originalPrice) - (b.salePrice || b.originalPrice));
          break;
        case 'price_high':
          categoryProducts.sort((a, b) => (b.salePrice || b.originalPrice) - (a.salePrice || a.originalPrice));
          break;
        case 'rating':
          categoryProducts.sort((a, b) => b.ratings.average - a.ratings.average);
          break;
        default:
          categoryProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
      
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, sortBy, priceRange, selectedSubcategories]);

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategory) 
        ? prev.filter(s => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  // Get unique subcategories from products
  const availableSubcategories = Array.from(new Set(products.map(p => p.subcategory).filter((sub): sub is string => Boolean(sub))));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {category?.name || categoryId.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
          </div>
          
          {category?.description && (
            <p className="text-gray-600 mb-4">{category.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {products.length} products found
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters & Sort
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters & Sorting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Customer Rating' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {availableSubcategories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Subcategories</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSubcategories.map((subcategory) => (
                      <Button
                        key={subcategory}
                        variant={selectedSubcategories.includes(subcategory) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSubcategory(subcategory)}
                      >
                        {subcategory}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ''}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                    className="w-24 px-3 py-1 border rounded"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max === 100000 ? '' : priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 100000 }))}
                    className="w-24 px-3 py-1 border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange({ min: 0, max: 100000 })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange({ min: 0, max: 1000 })}
          >
            Under ₹1,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange({ min: 1000, max: 5000 })}
          >
            ₹1,000 - ₹5,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange({ min: 5000, max: 20000 })}
          >
            ₹5,000 - ₹20,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange({ min: 20000, max: 100000 })}
          >
            Above ₹20,000
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                No products match your current filters. Try adjusting your criteria.
              </p>
              <Button onClick={() => {
                setPriceRange({ min: 0, max: 100000 });
                setSelectedSubcategories([]);
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
