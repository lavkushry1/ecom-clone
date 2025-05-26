'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ToastItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface AddToCartToastProps {
  isVisible: boolean;
  item?: ToastItem;
  onClose: () => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onViewCart?: () => void;
  autoHideDelay?: number;
}

export function AddToCartToast({
  isVisible,
  item,
  onClose,
  onUpdateQuantity,
  onViewCart,
  autoHideDelay = 5000
}: AddToCartToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto hide after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!item || !onUpdateQuantity) return;
    
    if (newQuantity <= 0) {
      handleClose();
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  if (!isVisible || !item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Toast Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full pointer-events-auto transform transition-all duration-300 ${
            isAnimating 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Added to Cart!
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Details */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                {item.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                ₹{item.price.toLocaleString()}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Qty:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 p-0"
                    onClick={() => handleUpdateQuantity(item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge variant="secondary" className="min-w-[32px] justify-center">
                    {item.quantity}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 p-0"
                    onClick={() => handleUpdateQuantity(item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleClose}
            >
              Continue Shopping
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                onViewCart?.();
                handleClose();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-150 ease-linear"
                style={{ 
                  width: '100%',
                  animation: `shrink ${autoHideDelay}ms linear`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}

// Hook to manage toast state
export function useAddToCartToast() {
  const [toast, setToast] = useState<{
    isVisible: boolean;
    item?: ToastItem;
  }>({
    isVisible: false
  });

  const showToast = (item: ToastItem) => {
    setToast({
      isVisible: true,
      item
    });
  };

  const hideToast = () => {
    setToast({
      isVisible: false,
      item: undefined
    });
  };

  const updateToastQuantity = (id: string, quantity: number) => {
    if (toast.item?.id === id) {
      setToast(prev => ({
        ...prev,
        item: prev.item ? { ...prev.item, quantity } : undefined
      }));
    }
  };

  return {
    toast,
    showToast,
    hideToast,
    updateToastQuantity
  };
}

// Mini Cart Animation (for cart icon)
interface CartIconAnimationProps {
  isAnimating: boolean;
  className?: string;
}

export function CartIconAnimation({ isAnimating, className }: CartIconAnimationProps) {
  return (
    <div className={`relative ${className}`}>
      <ShoppingCart 
        className={`h-6 w-6 transition-transform duration-200 ${
          isAnimating ? 'scale-110' : 'scale-100'
        }`} 
      />
      {isAnimating && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
