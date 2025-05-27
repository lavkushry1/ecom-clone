'use client';

import { useEffect } from 'react';
import PerformanceOptimizer, { measureWebVitals } from '@/lib/performance-optimizer';

interface PerformanceMonitorProps {
  pageName: string;
  children: React.ReactNode;
}

export function PerformanceMonitor({ pageName, children }: PerformanceMonitorProps) {
  useEffect(() => {
    // Initialize performance monitoring for this page
    measureWebVitals((metric) => {
      console.log('Web Vital:', metric);
    });
    
    // Preload critical resources based on page
    if (pageName === 'homepage') {
      PerformanceOptimizer.preloadImage('/images/hero-banner.jpg', true);
      PerformanceOptimizer.preloadImage('/images/categories/electronics.jpg');
      PerformanceOptimizer.preloadImage('/images/categories/fashion.jpg');
    } else if (pageName === 'product-details') {
      // Could add route prefetching here if needed
    }

    // Memory monitoring would be done by the optimizer
    return () => {
      // Cleanup if needed
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
      measureWebVitals(reportWebVitals);
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
