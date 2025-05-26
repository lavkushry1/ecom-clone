'use client';

import { useEffect } from 'react';
import { performanceOptimizer } from '@/lib/performance-optimizer';

interface PerformanceMonitorProps {
  pageName: string;
  children: React.ReactNode;
}

export function PerformanceMonitor({ pageName, children }: PerformanceMonitorProps) {
  useEffect(() => {
    // Initialize performance monitoring for this page
    performanceOptimizer.monitorWebVitals();
    
    // Preload critical resources based on page
    if (pageName === 'homepage') {
      performanceOptimizer.preloadCriticalImages([
        '/images/hero-banner.jpg',
        '/images/categories/electronics.jpg',
        '/images/categories/fashion.jpg'
      ]);
    } else if (pageName === 'product-details') {
      performanceOptimizer.prefetchRoute('/cart');
    }

    // Monitor memory usage
    const checkMemory = () => {
      performanceOptimizer.monitorMemoryUsage();
    };

    const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, [pageName]);

  return <>{children}</>;
}

// Hook for performance metrics
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Report Web Vitals to analytics
      const reportWebVitals = (metric: any) => {
        // In a real app, you'd send this to your analytics service
        console.log('Web Vital:', metric);
      };

      // Measure and report Core Web Vitals
      performanceOptimizer.monitorWebVitals();
    }
  }, []);

  return {
    measurePageLoad: () => {
      if (typeof window !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
        };
      }
      return null;
    },
    
    measureResourceLoad: (resourceUrl: string) => {
      if (typeof window !== 'undefined') {
        const resources = performance.getEntriesByName(resourceUrl);
        return resources.length > 0 ? resources[0].duration : null;
      }
      return null;
    }
  };
}
