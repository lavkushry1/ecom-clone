'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfferBannerSkeleton } from '@/components/ui/skeleton';

interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  bgColor: string;
  textColor?: string;
}

const defaultOffers: OfferBanner[] = [
  {
    id: '1',
    title: 'Big Billion Days',
    subtitle: 'Up to 80% off',
    discount: '80% OFF',
    image: '/images/banners/electronics-sale.jpg',
    bgColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
    textColor: 'text-white'
  },
  {
    id: '2',
    title: 'Fashion Festival',
    subtitle: 'Trending styles at lowest prices',
    discount: '60% OFF',
    image: '/images/banners/fashion-sale.jpg',
    bgColor: 'bg-gradient-to-r from-pink-500 to-red-500',
    textColor: 'text-white'
  },
  {
    id: '3',
    title: 'Electronics Mega Sale',
    subtitle: 'Best deals on gadgets',
    discount: '70% OFF',
    image: '/images/banners/electronics-mega.jpg',
    bgColor: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    textColor: 'text-white'
  },
  {
    id: '4',
    title: 'Home & Kitchen',
    subtitle: 'Transform your space',
    discount: '50% OFF',
    image: '/images/banners/home-kitchen.jpg',
    bgColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    textColor: 'text-white'
  }
];

interface OfferBannerSliderProps {
  offers?: OfferBanner[];
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

export function OfferBannerSlider({ 
  offers = defaultOffers, 
  autoScroll = true, 
  autoScrollInterval = 4000 
}: OfferBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsUserInteracting(true);
    setTimeout(() => setIsUserInteracting(false), 5000);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || isUserInteracting) return;

    const interval = setInterval(nextSlide, autoScrollInterval);
    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, isUserInteracting]);

  if (loading) {
    return <OfferBannerSkeleton />;
  }

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-2xl shadow-lg">
      {/* Slider Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`min-w-full h-full relative ${offer.bgColor} flex items-center justify-between px-6 md:px-12`}
          >
            {/* Content */}
            <div className={`flex-1 ${offer.textColor || 'text-white'}`}>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                {offer.title}
              </h2>
              <p className="text-sm md:text-lg mb-4 opacity-90">
                {offer.subtitle}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xl md:text-3xl font-bold bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                  {offer.discount}
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  Shop Now
                </Button>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">🎁</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2"
        onClick={() => {
          prevSlide();
          setIsUserInteracting(true);
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2"
        onClick={() => {
          nextSlide();
          setIsUserInteracting(true);
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {offers.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-80'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {autoScroll && !isUserInteracting && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: `${((Date.now() % autoScrollInterval) / autoScrollInterval) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}
