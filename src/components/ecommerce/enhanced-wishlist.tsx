'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCardSkeleton, ListSkeleton } from '@/components/ui/skeleton';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Trash2, 
  Star,
  Package,
  Filter,
  Grid,
  List,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  discount?: number;
  addedDate: string;
  description: string;
}

interface WishlistComponentProps {
  className?: string;
}

export function WishlistComponent({ className = '' }: WishlistComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);

  const { addItem } = useCart();
  const { toast } = useToast();

  // Simulate loading data
  useEffect(() => {
    const loadWishlistData = () => {
      setTimeout(() => {
        setWishlistItems([
          {
            id: '1',
            name: 'iPhone 15 Pro Max 256GB',
            price: 159900,
            originalPrice: 169900,
            image: '/api/placeholder/300/300',
            category: 'Electronics',
            brand: 'Apple',
            rating: 4.8,
            reviewCount: 2847,
            inStock: true,
            discount: 6,
            addedDate: '2024-12-20',
            description: 'Latest iPhone with titanium design and powerful A17 Pro chip'
          },
          {
            id: '2',
            name: 'MacBook Pro M3 14-inch',
            price: 199900,
            originalPrice: 219900,
            image: '/api/placeholder/300/300',
            category: 'Electronics',
            brand: 'Apple',
            rating: 4.9,
            reviewCount: 1567,
            inStock: true,
            discount: 9,
            addedDate: '2024-12-18',
            description: 'Powerful laptop with M3 chip for professional workflows'
          },
          {
            id: '3',
            name: 'Samsung Galaxy Watch 6',
            price: 29999,
            image: '/api/placeholder/300/300',
            category: 'Electronics',
            brand: 'Samsung',
            rating: 4.5,
            reviewCount: 892,
            inStock: false,
            addedDate: '2024-12-15',
            description: 'Advanced smartwatch with health monitoring features'
          },
          {
            id: '4',
            name: 'Sony WH-1000XM5 Headphones',
            price: 32990,
            originalPrice: 34990,
            image: '/api/placeholder/300/300',
            category: 'Electronics',
            brand: 'Sony',
            rating: 4.7,
            reviewCount: 3421,
            inStock: true,
            discount: 6,
            addedDate: '2024-12-12',
            description: 'Industry-leading noise canceling headphones'
          }
        ]);
        setIsLoading(false);
      }, 1500);
    };

    loadWishlistData();
  }, []);

  // Filter and sort wishlist items
  useEffect(() => {
    let filtered = [...wishlistItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, filterCategory, sortBy]);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const addToCartFromWishlist = (item: WishlistItem) => {
    if (!item.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    // Convert wishlist item to Product format for cart
    const productForCart: Product = {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      subcategory: item.category, // Use category as subcategory fallback
      brand: item.brand,
      salePrice: item.price,
      originalPrice: item.originalPrice || item.price,
      images: [item.image],
      stock: item.inStock ? 10 : 0, // Convert boolean to stock number
      ratings: {
        average: item.rating,
        count: item.reviewCount
      },
      specifications: {},
      features: [],
      tags: [item.category.toLowerCase()],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addItem(productForCart);

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const shareItem = (item: WishlistItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out this ${item.name} on our store!`,
        url: window.location.origin + `/products/${item.id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/products/${item.id}`);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard",
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

  const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports'];

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 w-full sm:w-80 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full sm:w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full sm:w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          
          {/* Items skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              My Wishlist
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dropdown
            value={filterCategory}
            onValueChange={setFilterCategory}
            placeholder="All Categories"
          >
            <DropdownItem value="all">All Categories</DropdownItem>
            {categories.map(category => (
              <DropdownItem key={category} value={category}>
                {category}
              </DropdownItem>
            ))}
          </Dropdown>

          <Dropdown
            value={sortBy}
            onValueChange={setSortBy}
            placeholder="Sort by"
          >
            <DropdownItem value="recent">Recently Added</DropdownItem>
            <DropdownItem value="name">Name A-Z</DropdownItem>
            <DropdownItem value="price-low">Price: Low to High</DropdownItem>
            <DropdownItem value="price-high">Price: High to Low</DropdownItem>
            <DropdownItem value="rating">Highest Rated</DropdownItem>
          </Dropdown>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all' ? 'No items found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add items to your wishlist to see them here'
              }
            </p>
            <Link href="/products">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        )}

        {/* Items Grid/List */}
        {filteredItems.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredItems.map((item) => (
              viewMode === 'grid' ? (
                <WishlistItemCard 
                  key={item.id} 
                  item={item} 
                  onRemove={removeFromWishlist}
                  onAddToCart={addToCartFromWishlist}
                  onShare={shareItem}
                  formatPrice={formatPrice}
                />
              ) : (
                <WishlistItemRow 
                  key={item.id} 
                  item={item} 
                  onRemove={removeFromWishlist}
                  onAddToCart={addToCartFromWishlist}
                  onShare={shareItem}
                  formatPrice={formatPrice}
                />
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid view component
function WishlistItemCard({ 
  item, 
  onRemove, 
  onAddToCart, 
  onShare, 
  formatPrice 
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
  onShare: (item: WishlistItem) => void;
  formatPrice: (price: number) => string;
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {item.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            {item.discount}% OFF
          </Badge>
        )}
        {!item.inStock && (
          <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
            Out of Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{item.brand}</p>
          <Link href={`/products/${item.id}`}>
            <h3 className="font-medium text-sm hover:text-blue-600 transition-colors line-clamp-2">
              {item.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
            </div>
            <span className="text-xs text-gray-400">({item.reviewCount})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{formatPrice(item.price)}</span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare(item)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// List view component
function WishlistItemRow({ 
  item, 
  onRemove, 
  onAddToCart, 
  onShare, 
  formatPrice 
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
  onShare: (item: WishlistItem) => void;
  formatPrice: (price: number) => string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{item.brand}</p>
              <Link href={`/products/${item.id}`}>
                <h3 className="font-medium hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                </div>
                <span className="text-xs text-gray-400">({item.reviewCount})</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
                {item.discount && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {item.discount}% OFF
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onAddToCart(item)}
                disabled={!item.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(item)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
