'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedSkeleton } from '@/components/ui/advanced-skeleton';
import { performanceOptimizer } from '@/lib/performance-optimizer';

interface WebVitalsMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

interface PerformanceData {
  webVitals: WebVitalsMetrics;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  networkStatus: 'online' | 'offline';
  connectionType?: string;
  loadTimes: {
    domContentLoaded: number;
    loadComplete: number;
    timeToFirstByte: number;
  };
}

export function RealTimePerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const collectPerformanceData = useCallback(async () => {
    try {
      const webVitals: WebVitalsMetrics = {};
      
      // Collect Web Vitals
      if (typeof window !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const loadTimes = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
        };

        // Memory usage (if available)
        let memoryUsage;
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
          };
        }

        // Network status
        const networkStatus = navigator.onLine ? 'online' : 'offline';
        const connectionType = (navigator as any).connection?.effectiveType || 'unknown';

        setPerformanceData({
          webVitals,
          memoryUsage,
          networkStatus,
          connectionType,
          loadTimes
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to collect performance data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data collection
    collectPerformanceData();

    // Update performance data periodically
    const interval = setInterval(collectPerformanceData, 5000);

    // Listen for Web Vitals updates
    performanceOptimizer.monitorWebVitals();

    return () => {
      clearInterval(interval);
    };
  }, [collectPerformanceData]);

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.poor) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (process.env.NODE_ENV === 'production' && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-colors"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  if (!isVisible && process.env.NODE_ENV === 'production') return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto custom-scrollbar z-50 bg-white/95 backdrop-blur-sm border-2">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Performance Monitor</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant={performanceData?.networkStatus === 'online' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {performanceData?.networkStatus}
            </Badge>
            {process.env.NODE_ENV === 'production' && (
              <button
                onClick={() => setIsVisible(false)}
                className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded text-xs flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <AdvancedSkeleton className="h-16 w-full rounded-lg" />
            <AdvancedSkeleton className="h-12 w-full rounded-lg" />
            <AdvancedSkeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Web Vitals */}
            <div>
              <h4 className="text-xs font-medium mb-2 text-gray-600">Core Web Vitals</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {performanceData?.webVitals.lcp && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceData.webVitals.lcp, { good: 2500, poor: 4000 })}`} />
                    <span>LCP: {Math.round(performanceData.webVitals.lcp)}ms</span>
                  </div>
                )}
                {performanceData?.webVitals.fid && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceData.webVitals.fid, { good: 100, poor: 300 })}`} />
                    <span>FID: {Math.round(performanceData.webVitals.fid)}ms</span>
                  </div>
                )}
                {performanceData?.webVitals.cls && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceData.webVitals.cls * 1000, { good: 100, poor: 250 })}`} />
                    <span>CLS: {performanceData.webVitals.cls.toFixed(3)}</span>
                  </div>
                )}
                {performanceData?.webVitals.fcp && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceData.webVitals.fcp, { good: 1800, poor: 3000 })}`} />
                    <span>FCP: {Math.round(performanceData.webVitals.fcp)}ms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Load Times */}
            <div>
              <h4 className="text-xs font-medium mb-2 text-gray-600">Load Times</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>TTFB:</span>
                  <span>{Math.round(performanceData?.loadTimes.timeToFirstByte || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>DOM:</span>
                  <span>{Math.round(performanceData?.loadTimes.domContentLoaded || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>{Math.round(performanceData?.loadTimes.loadComplete || 0)}ms</span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {performanceData?.memoryUsage && (
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600">Memory Usage</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{formatBytes(performanceData.memoryUsage.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{formatBytes(performanceData.memoryUsage.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        performanceData.memoryUsage.percentage > 80 ? 'bg-red-500' :
                        performanceData.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${performanceData.memoryUsage.percentage}%` }}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {performanceData.memoryUsage.percentage}%
                  </div>
                </div>
              </div>
            )}

            {/* Connection Info */}
            <div>
              <h4 className="text-xs font-medium mb-2 text-gray-600">Connection</h4>
              <div className="flex justify-between text-xs">
                <span>Type:</span>
                <span className="uppercase">{performanceData?.connectionType}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Enhanced Performance Provider with lazy loading
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    // Only show performance monitor in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('performance-monitor') === 'enabled';
    setShowMonitor(shouldShow);
  }, []);

  return (
    <>
      {children}
      {showMonitor && <RealTimePerformanceMonitor />}
    </>
  );
}
