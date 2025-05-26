'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3, 
  Tag, 
  FileText,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/admin/products', icon: Package },
      { name: 'Add Product', href: '/admin/products/new', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: Tag },
    ]
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 5, // This could be dynamic
    children: [
      { name: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Pending Orders', href: '/admin/orders?status=pending', icon: ShoppingCart },
      { name: 'Shipped Orders', href: '/admin/orders?status=shipped', icon: ShoppingCart },
    ]
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    children: [
      { name: 'Sales Report', href: '/admin/reports/sales', icon: FileText },
      { name: 'Product Report', href: '/admin/reports/products', icon: FileText },
      { name: 'Customer Report', href: '/admin/reports/customers', icon: FileText },
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/admin/settings', icon: Settings },
      { name: 'Payment', href: '/admin/settings/payment', icon: Settings },
      { name: 'Shipping', href: '/admin/settings/shipping', icon: Settings },
      { name: 'SEO', href: '/admin/settings/seo', icon: Settings },
    ]
  },
];

interface AdminNavigationProps {
  className?: string;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ className }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  const NavigationItem: React.FC<{ item: NavigationItem; level?: number }> = ({ 
    item, 
    level = 0 
  }) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const isItemExpanded = isExpanded(item.name);

    return (
      <div>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1',
              level > 0 && 'ml-6',
              isItemActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Icon className="mr-3 h-5 w-5" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => toggleExpanded(item.name)}
            >
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isItemExpanded && "transform rotate-180"
                )}
              />
            </Button>
          )}
        </div>
        
        {hasChildren && isItemExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavigationItem 
                key={child.href} 
                item={child} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation sidebar */}
      <nav
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation items */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavigationItem key={item.href} item={item} />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Handle logout
                console.log('Logout clicked');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content wrapper */}
      <div className="lg:ml-64">
        {/* This div creates space for the sidebar on desktop */}
      </div>
    </>
  );
};

export default AdminNavigation;
