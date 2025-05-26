'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AddToCartToast } from './add-to-cart-toast';

interface ToastItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface AddToCartContextType {
  showToast: (item: ToastItem) => void;
}

const AddToCartContext = createContext<AddToCartContextType | undefined>(undefined);

interface AddToCartProviderProps {
  children: ReactNode;
}

export function AddToCartProvider({ children }: AddToCartProviderProps) {
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

  const handleViewCart = () => {
    // Navigate to cart page
    window.location.href = '/cart';
    hideToast();
  };

  return (
    <AddToCartContext.Provider value={{ showToast }}>
      {children}
      <AddToCartToast
        isVisible={toast.isVisible}
        item={toast.item}
        onClose={hideToast}
        onUpdateQuantity={updateToastQuantity}
        onViewCart={handleViewCart}
      />
    </AddToCartContext.Provider>
  );
}

export function useAddToCartToast() {
  const context = useContext(AddToCartContext);
  if (context === undefined) {
    throw new Error('useAddToCartToast must be used within an AddToCartProvider');
  }
  return context;
}
