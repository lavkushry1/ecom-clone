'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  X, 
  Package, 
  ShoppingCart, 
  Truck, 
  Tag, 
  Star,
  Gift,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Heart,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'order' | 'offer' | 'product' | 'review' | 'wishlist' | 'general' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    offerId?: string;
    amount?: number;
    productName?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #FK12345678 has been shipped and is on its way!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      actionUrl: '/orders/FK12345678',
      actionText: 'Track Order',
      metadata: {
        orderId: 'FK12345678'
      }
    },
    {
      id: '2',
      type: 'offer',
      title: 'Flash Sale Alert!',
      message: '50% off on all electronics. Limited time offer ending soon!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      actionUrl: '/products?category=electronics',
      actionText: 'Shop Now'
    },
    {
      id: '3',
      type: 'product',
      title: 'Back in Stock',
      message: 'iPhone 15 Pro Max that you wishlisted is now available!',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      actionUrl: '/products/iphone-15-pro-max',
      actionText: 'View Product',
      metadata: {
        productId: 'iphone-15-pro-max',
        productName: 'iPhone 15 Pro Max'
      }
    },
    {
      id: '4',
      type: 'review',
      title: 'Review Request',
      message: 'How was your recent purchase? Share your experience with other customers.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      actionUrl: '/reviews/write',
      actionText: 'Write Review'
    },
    {
      id: '5',
      type: 'success',
      title: 'Order Delivered',
      message: 'Your order #FK12345677 has been successfully delivered. Thank you for shopping with us!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      actionUrl: '/orders/FK12345677',
      actionText: 'View Order',
      metadata: {
        orderId: 'FK12345677'
      }
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

interface NotificationDropdownProps {
  onClose: () => void;
}

function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const unreadNotifications = notifications.filter(n => !n.read);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <Card className="notification-dropdown w-80 max-w-sm shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadNotifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {unreadNotifications.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View All Notifications
          </Button>
        </div>
      )}
    </Card>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove, onClose }: NotificationItemProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'offer':
        return <Tag className="h-5 w-5 text-green-600" />;
      case 'product':
        return <ShoppingCart className="h-5 w-5 text-purple-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'wishlist':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead();
    }
    if (notification.actionUrl && typeof window !== 'undefined') {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  return (
    <div 
      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </span>
                {!notification.read && (
                  <Badge variant="outline" className="text-xs">
                    New
                  </Badge>
                )}
              </div>
              {notification.actionText && (
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                  {notification.actionText}
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Full page notification center component
export function NotificationCenter() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your orders, offers, and more
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </Button>
        </div>
      </div>

      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread' 
              ? 'You have no unread notifications.'
              : 'We\'ll notify you when something important happens.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <NotificationItem
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
                onClose={() => {}}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
