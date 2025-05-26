'use client';

import { cn } from '@/lib/utils';

interface AdvancedSkeletonProps {
  className?: string;
  shimmer?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'dark' | 'light';
}

export function AdvancedSkeleton({ 
  className = '', 
  shimmer = true,
  rounded = 'md',
  variant = 'default'
}: AdvancedSkeletonProps) {
  const baseClasses = 'relative overflow-hidden';
  
  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    dark: 'bg-gray-800',
    light: 'bg-gray-100'
  };
  
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        roundedClasses[rounded],
        shimmer && 'animate-pulse',
        className
      )}
      aria-label="Loading..."
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
}

// Hero Banner Skeleton with enhanced animations
export function HeroBannerSkeleton() {
  return (
    <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-2xl">
      <AdvancedSkeleton className="w-full h-full" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-2xl px-6">
          <AdvancedSkeleton className="h-8 md:h-12 w-80 mx-auto" />
          <AdvancedSkeleton className="h-6 md:h-8 w-96 mx-auto" />
          <div className="space-y-2">
            <AdvancedSkeleton className="h-4 md:h-6 w-full" />
            <AdvancedSkeleton className="h-4 md:h-6 w-3/4 mx-auto" />
          </div>
          <div className="flex gap-4 justify-center mt-6">
            <AdvancedSkeleton className="h-12 w-32 rounded-lg" />
            <AdvancedSkeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <AdvancedSkeleton key={index} className="w-3 h-3" rounded="full" />
        ))}
      </div>
    </div>
  );
}

// Advanced Search Skeleton
export function AdvancedSearchSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-2">
          <AdvancedSkeleton className="h-8 w-48" />
          <AdvancedSkeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <AdvancedSkeleton className="h-10 w-24 rounded-lg" />
          <AdvancedSkeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <AdvancedSkeleton className="h-14 w-full rounded-xl" />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <AdvancedSkeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <AdvancedSkeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <AdvancedSkeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// Chat Support Skeleton
export function ChatSupportSkeleton() {
  return (
    <div className="h-96 border border-gray-200 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <AdvancedSkeleton className="w-10 h-10" rounded="full" />
          <div className="space-y-2">
            <AdvancedSkeleton className="h-5 w-32" />
            <AdvancedSkeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Incoming messages */}
        <div className="flex gap-3">
          <AdvancedSkeleton className="w-8 h-8 flex-shrink-0" rounded="full" />
          <div className="space-y-2">
            <AdvancedSkeleton className="h-10 w-48 rounded-2xl" />
            <AdvancedSkeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Outgoing messages */}
        <div className="flex gap-3 justify-end">
          <div className="space-y-2">
            <AdvancedSkeleton className="h-10 w-40 rounded-2xl ml-auto" />
            <AdvancedSkeleton className="h-4 w-12 ml-auto" />
          </div>
        </div>
        
        {/* More incoming */}
        <div className="flex gap-3">
          <AdvancedSkeleton className="w-8 h-8 flex-shrink-0" rounded="full" />
          <div className="space-y-2">
            <AdvancedSkeleton className="h-16 w-56 rounded-2xl" />
            <AdvancedSkeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <AdvancedSkeleton className="flex-1 h-10 rounded-lg" />
          <AdvancedSkeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Analytics Dashboard Skeleton
export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <AdvancedSkeleton className="h-8 w-48" />
          <AdvancedSkeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <AdvancedSkeleton className="h-10 w-32 rounded-lg" />
          <AdvancedSkeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <AdvancedSkeleton className="h-5 w-24" />
              <AdvancedSkeleton className="w-8 h-8 rounded-lg" />
            </div>
            <AdvancedSkeleton className="h-8 w-20 mb-2" />
            <div className="flex items-center gap-2">
              <AdvancedSkeleton className="h-4 w-12" />
              <AdvancedSkeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-6">
          <AdvancedSkeleton className="h-6 w-32 mb-6" />
          <AdvancedSkeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="border border-gray-200 rounded-xl p-6">
          <AdvancedSkeleton className="h-6 w-40 mb-6" />
          <AdvancedSkeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="border border-gray-200 rounded-xl p-6">
        <AdvancedSkeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <AdvancedSkeleton className="w-10 h-10" rounded="full" />
              <div className="flex-1 space-y-2">
                <AdvancedSkeleton className="h-5 w-full" />
                <AdvancedSkeleton className="h-4 w-3/4" />
              </div>
              <AdvancedSkeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Notification System Skeleton
export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AdvancedSkeleton className="w-10 h-10 flex-shrink-0" rounded="full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <AdvancedSkeleton className="h-5 w-32" />
                <AdvancedSkeleton className="h-4 w-16" />
              </div>
              <AdvancedSkeleton className="h-4 w-full" />
              <AdvancedSkeleton className="h-4 w-2/3" />
            </div>
            <AdvancedSkeleton className="w-6 h-6 flex-shrink-0" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );
}
