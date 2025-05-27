'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderTrackingSkeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Download,
  AlertCircle,
  Calendar,
  Navigation
} from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: Date;
  isCompleted: boolean;
  details?: string;
}

interface ShippingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  currentLocation: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    photo?: string;
  };
}

interface OrderTrackingProps {
  orderId: string;
  orderStatus: string;
  shippingInfo?: ShippingInfo;
  onContactDeliveryPerson?: () => void;
  onShareTracking?: () => void;
  onDownloadInvoice?: () => void;
}

export function OrderTracking({ 
  orderId, 
  orderStatus,
  shippingInfo,
  onContactDeliveryPerson,
  onShareTracking,
  onDownloadInvoice
}: OrderTrackingProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock tracking data generation
  useEffect(() => {
    const generateTrackingEvents = () => {
      const baseDate = new Date();
      const events: TrackingEvent[] = [
        {
          id: '1',
          status: 'Order Placed',
          description: 'Your order has been successfully placed',
          location: 'Online',
          timestamp: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          details: 'Order confirmed and payment processed'
        },
        {
          id: '2',
          status: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          location: 'Seller Warehouse',
          timestamp: new Date(baseDate.getTime() - 2.8 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          details: 'Items verified and ready for packaging'
        },
        {
          id: '3',
          status: 'Packed',
          description: 'Your order has been packed',
          location: 'Fulfillment Center - Mumbai',
          timestamp: new Date(baseDate.getTime() - 2.5 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          details: 'Package secured and labeled for shipping'
        },
        {
          id: '4',
          status: 'Shipped',
          description: 'Your order is on the way',
          location: 'Transit Hub - Mumbai',
          timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          details: 'Package dispatched to delivery partner'
        },
        {
          id: '5',
          status: 'In Transit',
          description: 'Package is moving towards destination',
          location: 'Transit Hub - Delhi',
          timestamp: new Date(baseDate.getTime() - 1.2 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          details: 'Package arrived at regional sorting facility'
        },
        {
          id: '6',
          status: 'Out for Delivery',
          description: 'Package is out for delivery',
          location: 'Local Delivery Center - Delhi',
          timestamp: new Date(baseDate.getTime() - 6 * 60 * 60 * 1000),
          isCompleted: orderStatus === 'delivered',
          details: 'Assigned to delivery partner for final delivery'
        },
        {
          id: '7',
          status: 'Delivered',
          description: 'Package delivered successfully',
          location: 'Your Address',
          timestamp: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000),
          isCompleted: orderStatus === 'delivered',
          details: orderStatus === 'delivered' ? 'Package delivered and received' : 'Expected delivery'
        }
      ];

      // Filter events based on current order status
      let filteredEvents = events;
      if (orderStatus === 'processing') {
        filteredEvents = events.slice(0, 3);
      } else if (orderStatus === 'shipped') {
        filteredEvents = events.slice(0, 5);
      } else if (orderStatus === 'out_for_delivery') {
        filteredEvents = events.slice(0, 6);
      }

      setTrackingEvents(filteredEvents);
    };

    generateTrackingEvents();
    setLoading(false);
  }, [orderId, orderStatus]);

  const refreshTracking = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (!isCompleted) {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }

    switch (status.toLowerCase()) {
      case 'order placed':
      case 'order confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'packed':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
      case 'in transit':
      case 'out for delivery':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'out for delivery':
        return <Badge className="bg-orange-100 text-orange-800">Out for Delivery</Badge>;
      case 'shipped':
      case 'in transit':
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCurrentStatus = () => {
    const currentEvent = trackingEvents.find(event => !event.isCompleted) || 
                        trackingEvents[trackingEvents.length - 1];
    return currentEvent;
  };

  if (loading) {
    return <OrderTrackingSkeleton />;
  }

  const currentStatus = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{orderId}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(orderStatus)}
                {currentStatus && (
                  <span className="text-sm text-gray-600">
                    {currentStatus.description}
                  </span>
                )}
              </div>
            </div>
            <Button 
              onClick={refreshTracking} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>

        {currentStatus && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="space-y-1">
                  <p className="font-medium">{currentStatus.status}</p>
                  <p className="text-sm text-gray-600">{currentStatus.description}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {currentStatus.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {currentStatus.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>

              {shippingInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Carrier:</span> {shippingInfo.carrier}</p>
                    <p><span className="text-gray-600">Tracking:</span> {shippingInfo.trackingNumber}</p>
                    <p><span className="text-gray-600">Current Location:</span> {shippingInfo.currentLocation}</p>
                    <p><span className="text-gray-600">Est. Delivery:</span> {shippingInfo.estimatedDelivery.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delivery Person Info (if available) */}
      {shippingInfo?.deliveryPerson && orderStatus === 'out_for_delivery' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Your delivery partner</h4>
                  <p className="text-sm text-gray-600">{shippingInfo.deliveryPerson.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onContactDeliveryPerson}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < trackingEvents.length - 1 && (
                  <div className={`absolute left-6 top-8 w-0.5 h-16 ${
                    event.isCompleted ? 'bg-green-200' : 'bg-gray-200'
                  }`} />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    event.isCompleted 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    {getStatusIcon(event.status, event.isCompleted)}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${
                        event.isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {event.status}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      event.isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {event.description}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${
                      event.isCompleted ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    {event.details && (
                      <p className={`text-xs mt-1 ${
                        event.isCompleted ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShareTracking}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Tracking
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDownloadInvoice}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>

            {shippingInfo && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://maps.google.com/?q=${shippingInfo.currentLocation}`, '_blank')}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Track on Map
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Need Help?</h4>
              <p className="text-sm text-yellow-700 mb-2">
                If your package hasn&apos;t arrived within the expected timeframe or you have any concerns, 
                our customer support team is here to help.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-yellow-300">
                  Report an Issue
                </Button>
                <Button size="sm" variant="outline" className="border-yellow-300">
                  FAQ
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
