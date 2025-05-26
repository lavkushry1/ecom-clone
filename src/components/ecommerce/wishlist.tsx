'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCardSkeleton, ListSkeleton } from '@/components/ui/skeleton';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>(wishlistItems);

  const { addToCart } = useCart();
  const { toast } = useToast();

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

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categories = Array.from(new Set(wishlistItems.map(item => item.category)));

  if (wishlistItems.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Save items you love to your wishlist. You can add items by clicking the heart icon on any product.
        </p>
        <Link href="/products">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
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

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search wishlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items match your current filters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onRemove={() => removeFromWishlist(item.id)}
              onAddToCart={() => addToCartFromWishlist(item)}
              onShare={() => shareItem(item)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
  viewMode: 'grid' | 'list';
  onRemove: () => void;
  onAddToCart: () => void;
  onShare: () => void;
  formatCurrency: (amount: number) => string;
}

function WishlistItemCard({ 
  item, 
  viewMode, 
  onRemove, 
  onAddToCart, 
  onShare, 
  formatCurrency 
}: WishlistItemCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              {item.discount && (
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {item.discount}% OFF
                </Badge>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">{item.brand}</p>
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating}</span>
                  <span className="text-muted-foreground">({item.reviewCount})</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{formatCurrency(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
                {!item.inStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                onClick={onAddToCart}
                disabled={!item.inStock}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onRemove}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            {item.discount}% OFF
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-white">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <Link href={`/products/${item.id}`}>
            <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{item.brand}</p>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{item.rating}</span>
          <span className="text-muted-foreground">({item.reviewCount})</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">{formatCurrency(item.price)}</span>
            {item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={onAddToCart}
            disabled={!item.inStock}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
