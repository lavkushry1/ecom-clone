'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  X,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Star,
  Tag,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail
} from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion' | 'review' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  types: Record<NotificationType, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  showToast: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: true,
  push: true,
  types: {
    info: true,
    success: true,
    warning: true,
    error: true,
    order: true,
    promotion: true,
    review: true,
    system: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: NotificationType }>>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    // Check if notifications are enabled for this type
    if (!settings.enabled || !settings.types[notification.type]) {
      return;
    }

    // Check quiet hours
    if (settings.quietHours.enabled && isQuietHours()) {
      return;
    }

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound
    if (settings.sound) {
      playNotificationSound();
    }

    // Show desktop notification
    if (settings.desktop && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const showToast = (message: string, type: NotificationType = 'info', duration = 3000) => {
    const toastId = `toast-${Date.now()}-${Math.random()}`;
    const toast = { id: toastId, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, duration);
  };

  const isQuietHours = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't be played
      });
    } catch (error) {
      // Ignore errors
    }
  };

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    showToast
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </NotificationContext.Provider>
  );
}

interface NotificationCenterProps {
  className?: string;
  maxHeight?: string;
}

export function NotificationCenter({ className = '', maxHeight = '400px' }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'order':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-purple-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-orange-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="w-fit text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'You\'ll see notifications here when they arrive.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.onAction) {
                        notification.onAction();
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.persistent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.actionLabel && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto mt-2 text-blue-600"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const { settings, updateSettings } = useNotifications();

  const handleTypeToggle = (type: NotificationType, enabled: boolean) => {
    updateSettings({
      types: {
        ...settings.types,
        [type]: enabled
      }
    });
  };

  const notificationTypes = [
    { key: 'order' as const, label: 'Order Updates', description: 'Order status, shipping, and delivery notifications', icon: Package },
    { key: 'promotion' as const, label: 'Promotions & Deals', description: 'Special offers, discounts, and promotional campaigns', icon: Tag },
    { key: 'review' as const, label: 'Reviews & Ratings', description: 'Review requests and feedback notifications', icon: Star },
    { key: 'system' as const, label: 'System Updates', description: 'Account changes, security alerts, and system maintenance', icon: Settings },
    { key: 'info' as const, label: 'General Information', description: 'Product updates and general announcements', icon: Info },
    { key: 'success' as const, label: 'Success Messages', description: 'Confirmation messages and successful actions', icon: CheckCircle },
    { key: 'warning' as const, label: 'Warnings', description: 'Important warnings and attention messages', icon: AlertTriangle },
    { key: 'error' as const, label: 'Error Alerts', description: 'Error messages and failed actions', icon: AlertCircle }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Enable Notifications</h3>
            <p className="text-sm text-gray-600">Turn notifications on or off globally</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled: boolean) => updateSettings({ enabled })}
          />
        </div>

        <Separator />

        {/* Delivery Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Methods</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in your browser</p>
                </div>
              </div>
              <Switch
                checked={settings.desktop}
                onCheckedChange={(desktop: boolean) => updateSettings({ desktop })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Sound Notifications</p>
                  <p className="text-sm text-gray-600">Play sound for new notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(sound: boolean) => updateSettings({ sound })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(email: boolean) => updateSettings({ email })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                </div>
              </div>
              <Switch
                checked={settings.push}
                onCheckedChange={(push: boolean) => updateSettings({ push })}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Quiet Hours</h3>
              <p className="text-sm text-gray-600">Disable notifications during specific hours</p>
            </div>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(enabled: boolean) => updateSettings({
                quietHours: { ...settings.quietHours, enabled }
              })}
              disabled={!settings.enabled}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => updateSettings({
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => updateSettings({
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <p className="text-sm text-gray-600">Choose which types of notifications you want to receive</p>
          
          <div className="space-y-3">
            {notificationTypes.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.types[key]}
                  onCheckedChange={(enabled: boolean) => handleTypeToggle(key, enabled)}
                  disabled={!settings.enabled}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: NotificationType }>;
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getToastStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getToastIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${getToastStyles(toast.type)}`}
        >
          {getToastIcon(toast.type)}
          <span className="flex-1">{toast.message}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(toast.id)}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
