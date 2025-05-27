'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecentlyViewed } from '@/components/ecommerce/recently-viewed';
import { 
  Clock, 
  Search, 
  Filter,
  RotateCcw,
  ArrowLeft,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ViewAnalytics {
  totalViewed: number;
  uniqueProducts: number;
  averageViewsPerProduct: number;
  mostViewedCategory: string;
  viewsToday: number;
  viewsThisWeek: number;
}

export default function RecentlyViewedPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<ViewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Calculate analytics from localStorage
    const calculateAnalytics = () => {
      try {
        const storedData = localStorage.getItem('recently-viewed-guest');
        if (!storedData) {
          setAnalytics({
            totalViewed: 0,
            uniqueProducts: 0,
            averageViewsPerProduct: 0,
            mostViewedCategory: 'None',
            viewsToday: 0,
            viewsThisWeek: 0
          });
          return;
        }

        const products = JSON.parse(storedData);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalViewed = products.reduce((sum: number, p: any) => sum + p.viewCount, 0);
        const uniqueProducts = products.length;
        const averageViewsPerProduct = uniqueProducts > 0 ? totalViewed / uniqueProducts : 0;

        // Count views per category
        const categoryViews: Record<string, number> = {};
        products.forEach((p: any) => {
          categoryViews[p.category] = (categoryViews[p.category] || 0) + p.viewCount;
        });
        const mostViewedCategory = Object.keys(categoryViews).reduce((a, b) => 
          categoryViews[a] > categoryViews[b] ? a : b, 'None'
        );

        // Count views by time
        const viewsToday = products.filter((p: any) => 
          new Date(p.viewedAt) >= today
        ).reduce((sum: number, p: any) => sum + p.viewCount, 0);

        const viewsThisWeek = products.filter((p: any) => 
          new Date(p.viewedAt) >= weekAgo
        ).reduce((sum: number, p: any) => sum + p.viewCount, 0);

        setAnalytics({
          totalViewed,
          uniqueProducts,
          averageViewsPerProduct: Math.round(averageViewsPerProduct * 10) / 10,
          mostViewedCategory,
          viewsToday,
          viewsThisWeek
        });
      } catch (error) {
        console.error('Error calculating analytics:', error);
        setAnalytics({
          totalViewed: 0,
          uniqueProducts: 0,
          averageViewsPerProduct: 0,
          mostViewedCategory: 'None',
          viewsToday: 0,
          viewsThisWeek: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateAnalytics();
  }, []);

  const clearAllHistory = () => {
    localStorage.removeItem('recently-viewed-guest');
    setAnalytics({
      totalViewed: 0,
      uniqueProducts: 0,
      averageViewsPerProduct: 0,
      mostViewedCategory: 'None',
      viewsToday: 0,
      viewsThisWeek: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                Recently Viewed Products
              </h1>
              <p className="text-gray-600 mt-1">
                Your browsing history and product analytics
              </p>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalViewed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unique Products</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.uniqueProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Views/Product</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.averageViewsPerProduct}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Views Today</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.viewsToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Insights */}
          {analytics && analytics.uniqueProducts > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Browsing Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Most Viewed Category</p>
                    <p className="font-bold text-blue-900">{analytics.mostViewedCategory}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Views This Week</p>
                    <p className="font-bold text-green-900">{analytics.viewsThisWeek}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Browsing Activity</p>
                    <p className="font-bold text-purple-900">
                      {analytics.viewsToday > 5 ? 'Very Active' : 
                       analytics.viewsToday > 2 ? 'Active' : 'Light'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search your viewed products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearAllHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recently Viewed Products */}
          <RecentlyViewed
            maxItems={50}
            variant="detailed"
            showActions={true}
            showTimestamp={true}
            showViewCount={true}
            hideTitle={true}
            onClearHistory={clearAllHistory}
            className="border-0 shadow-none bg-transparent p-0"
          />

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Need more products?</h3>
                  <p className="text-sm text-gray-600">
                    Discover new products based on your browsing history
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/products">
                    <Button variant="outline">
                      Browse Products
                    </Button>
                  </Link>
                  <Link href="/products/recommendations">
                    <Button>
                      Get Recommendations
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-blue-900 mb-2">💡 Browsing Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your recently viewed products are saved locally for up to 50 items</li>
                <li>• Use the filters to find specific products from your history</li>
                <li>• Products viewed in the current session are marked as &quot;Recent&quot;</li>
                <li>• Clear your history anytime to start fresh</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
