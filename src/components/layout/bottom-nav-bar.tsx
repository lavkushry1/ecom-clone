'use client';

import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function BottomNavBar() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const cartItemsCount = getTotalItems();

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'Categories',
      href: '/products',
      icon: Grid3X3,
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      badge: cartItemsCount,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 relative transition-colors duration-200 ${
                active 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
                  }`} 
                />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span 
                className={`text-xs mt-1 font-medium transition-all duration-200 ${
                  active ? 'text-blue-600 scale-105' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
