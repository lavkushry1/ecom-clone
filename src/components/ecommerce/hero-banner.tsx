import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const banners = [
  {
    id: 1,
    title: 'Big Billion Days',
    subtitle: 'Up to 80% off on Electronics',
    image: '/images/banners/electronics-sale.jpg',
    bgColor: 'bg-gradient-to-r from-blue-500 to-purple-600'
  },
  {
    id: 2,
    title: 'Fashion Sale',
    subtitle: 'Trending styles at lowest prices',
    image: '/images/banners/fashion-sale.jpg',
    bgColor: 'bg-gradient-to-r from-pink-500 to-red-500'
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Transform your space',
    image: '/images/banners/home-sale.jpg',
    bgColor: 'bg-gradient-to-r from-green-500 to-teal-600'
  }
]

export function HeroBanner() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-8">
        <div className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
          {/* Main Banner */}
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-gradient-to-r from-flipkart-blue to-blue-700 flex items-center justify-between text-white">
                <div className="flex-1 p-8 md:p-12">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    Welcome to Flipkart Clone
                  </h1>
                  <p className="text-lg md:text-xl mb-6 opacity-90">
                    Your one-stop destination for online shopping
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-flipkart-yellow text-flipkart-blue hover:bg-yellow-400"
                    >
                      Shop Electronics
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-flipkart-blue"
                    >
                      Explore Fashion
                    </Button>
                  </div>
                </div>
                
                <div className="hidden lg:block flex-1 p-8">
                  <div className="text-right">
                    <div className="text-6xl mb-4">🛍️</div>
                    <div className="space-y-2">
                      <div className="text-sm opacity-75">✅ Free Delivery</div>
                      <div className="text-sm opacity-75">✅ Easy Returns</div>
                      <div className="text-sm opacity-75">✅ Secure Payments</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === 0 ? 'bg-flipkart-blue' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
