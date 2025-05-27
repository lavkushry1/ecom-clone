'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/ecommerce/hero-banner';
import { CategoryGrid } from '@/components/ecommerce/category-grid';
import { ProductCard } from '@/components/ecommerce/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { PerformanceMonitor } from '@/components/performance/performance-monitor';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Star, Truck, RotateCcw, Shield } from 'lucide-react';

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts, loading } = useProducts({ autoFetch: false });

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);
  return (
    <PerformanceMonitor pageName="homepage">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <HeroBanner />
      
      {/* Categories Section */}
      <CategoryGrid />
      
      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the best products at unbeatable prices
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Link href="/products">
                  <Button size="lg" variant="outline">
                    View All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No featured products yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Featured products will appear here once they are configured.
                </p>
                <Link href="/products">
                  <Button>Browse All Products</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-12 bg-gradient-to-r from-flipkart-blue to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Special Offers</h2>
            <p className="text-xl mb-8">Get the best deals on your favorite products</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2">Welcome Offer</h3>
                  <p className="mb-4">Get 10% off on your first order</p>
                  <code className="bg-white/20 px-3 py-1 rounded text-sm">WELCOME10</code>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">🚚</div>
                  <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                  <p className="mb-4">On orders above ₹499</p>
                  <span className="text-sm">No minimum quantity</span>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-2">Flash Sale</h3>
                  <p className="mb-4">Up to 50% off on electronics</p>
                  <span className="text-sm">Limited time offer</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Setup Status */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-8 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Project Setup Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Your Flipkart clone is ready for development. Here&apos;s what&apos;s been set up:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-600 mb-3">✅ Completed</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Next.js 14+ with App Router</li>
                  <li>✅ TypeScript configuration</li>
                  <li>✅ Tailwind CSS + Shadcn/UI</li>
                  <li>✅ Firebase client & admin setup</li>
                  <li>✅ Essential components (Header, Footer, ProductCard)</li>
                  <li>✅ Custom hooks (useCart, useWishlist)</li>
                  <li>✅ Server actions for products</li>
                  <li>✅ Type definitions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-600 mb-3">🔄 Next Steps</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>🔄 Configure Firebase project & environment</li>
                  <li>🔄 Set up Firestore collections & security rules</li>
                  <li>🔄 Create product catalog pages</li>
                  <li>🔄 Build checkout flow with guest support</li>
                  <li>🔄 Implement UPI QR & credit card payments</li>
                  <li>🔄 Create admin dashboard</li>
                  <li>🔄 Add authentication system</li>
                  <li>🔄 Deploy to Firebase Hosting</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">🚀 Ready to start development?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Run the development server and start building your e-commerce platform:
              </p>
              <code className="block p-2 bg-gray-100 rounded text-sm">
                npm run dev
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
    </PerformanceMonitor>
  )
}
