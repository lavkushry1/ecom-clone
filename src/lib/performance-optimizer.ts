/**
 * Performance optimization utilities for the e-commerce platform
 * Implements lazy loading, caching, and optimization strategies
 */

// Image optimization configurations
export const imageOptimization = {
  // Responsive image sizes for different breakpoints
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Image quality settings
  quality: {
    thumbnail: 60,
    card: 75,
    detail: 85,
    hero: 90
  },

  // Image formats priority
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  
  // Placeholder configurations
  placeholder: {
    blur: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    solid: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4='
  }
};

// Lazy loading configurations
export const lazyLoadConfig = {
  // Intersection Observer options
  intersectionOptions: {
    rootMargin: '50px 0px',
    threshold: 0.1
  },

  // Component lazy load delay
  componentDelay: 100,
  
  // Image lazy load settings
  imageLoadingStrategy: 'lazy' as const,
  
  // Priority loading for above-the-fold content
  priorityImages: [
    'hero-banner',
    'featured-products',
    'category-grid'
  ]
};

// Caching strategies
export const cacheConfig = {
  // Browser cache durations
  staticAssets: {
    images: 31536000, // 1 year
    fonts: 31536000,  // 1 year
    css: 86400,       // 1 day
    js: 86400         // 1 day
  },

  // API cache durations (in seconds)
  apiCache: {
    products: 300,     // 5 minutes
    categories: 3600,  // 1 hour
    settings: 1800,    // 30 minutes
    orders: 60         // 1 minute
  },

  // Service Worker cache strategies
  cacheStrategies: {
    pages: 'stale-while-revalidate',
    api: 'network-first',
    static: 'cache-first'
  }
};

// Bundle optimization
export const bundleOptimization = {
  // Code splitting boundaries
  chunks: {
    vendor: ['react', 'react-dom', 'next'],
    firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
    ui: ['lucide-react', '@radix-ui/react-*'],
    utils: ['date-fns', 'lodash', 'clsx']
  },

  // Dynamic import patterns
  dynamicImports: [
    'admin/**/*',
    'components/payment/**/*',
    'components/charts/**/*'
  ],

  // Tree shaking optimizations
  treeShaking: {
    sideEffects: false,
    usedExports: true
  }
};

// Performance monitoring
export const performanceConfig = {
  // Core Web Vitals thresholds
  vitals: {
    lcp: 2500,      // Largest Contentful Paint
    fid: 100,       // First Input Delay
    cls: 0.1,       // Cumulative Layout Shift
    fcp: 1800,      // First Contentful Paint
    ttfb: 800       // Time to First Byte
  },

  // Performance budget
  budget: {
    totalSize: 1500,    // 1.5MB total
    jsSize: 500,        // 500KB JavaScript
    cssSize: 100,       // 100KB CSS
    imageSize: 800,     // 800KB images
    fontSize: 100       // 100KB fonts
  },

  // Monitoring endpoints
  analytics: {
    webVitals: '/api/analytics/web-vitals',
    performance: '/api/analytics/performance',
    errors: '/api/analytics/errors'
  }
};

// Runtime optimization utilities
export class PerformanceOptimizer {
  private static intersectionObserver: IntersectionObserver | null = null;
  private static imageCache = new Map<string, HTMLImageElement>();
  private static componentCache = new Map<string, any>();

  // Initialize intersection observer for lazy loading
  static initializeIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    if (typeof window === 'undefined') return null;

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(callback, lazyLoadConfig.intersectionOptions);
    }
    return this.intersectionObserver;
  }

  // Preload critical images
  static preloadImage(src: string, priority: boolean = false): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (priority) {
        img.fetchPriority = 'high';
      }

      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }

  // Debounce utility for performance-sensitive operations
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  // Throttle utility for scroll/resize events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Measure component render performance
  static measureComponentPerformance(componentName: string, renderFn: () => any) {
    if (typeof window === 'undefined') return renderFn();

    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    if (endTime - startTime > 16) { // More than one frame
      console.warn(`Slow component render: ${componentName} took ${endTime - startTime}ms`);
    }

    return result;
  }

  // Check if device has limited resources
  static isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    // Check for Navigator.hardwareConcurrency
    const cores = (navigator as any).hardwareConcurrency || 4;
    
    // Check for Navigator.connection
    const connection = (navigator as any).connection;
    const slowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.effectiveType === '3g'
    );

    // Check for Navigator.deviceMemory
    const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;

    return cores < 4 || slowConnection || lowMemory;
  }

  // Adaptive loading based on device capabilities
  static getAdaptiveConfig() {
    const isLowEnd = this.isLowEndDevice();
    
    return {
      imageQuality: isLowEnd ? imageOptimization.quality.thumbnail : imageOptimization.quality.card,
      enableAnimations: !isLowEnd,
      maxConcurrentRequests: isLowEnd ? 2 : 6,
      preloadImages: !isLowEnd,
      enableServiceWorker: !isLowEnd
    };
  }

  // Memory usage monitoring
  static monitorMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return null;

    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      allocated: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
    };
  }

  // Clean up resources
  static cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    this.imageCache.clear();
    this.componentCache.clear();
  }
}

// Web Vitals measurement
export function measureWebVitals(onPerfEntry?: (metric: any) => void) {
  if (typeof window === 'undefined' || !onPerfEntry) return;

  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  });
}

// Resource hints for preloading
export const resourceHints = {
  // DNS prefetch for external domains
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//www.google-analytics.com'
  ],

  // Preconnect to critical domains
  preconnect: [
    'https://firebaseapp.com',
    'https://firebasestorage.googleapis.com'
  ],

  // Preload critical resources
  preload: [
    '/fonts/inter-var.woff2',
    '/images/logo.svg'
  ]
};

export default PerformanceOptimizer;
