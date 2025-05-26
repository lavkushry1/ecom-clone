'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Calendar,
  ArrowLeft,
  Copy,
  Download
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OrderStatus {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  timestamp: string
  location?: string
  description: string
}

interface OrderDetails {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    id: string
    name: string
    image: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    phone: string
  }
  estimatedDelivery: string
  trackingNumber?: string
  statusHistory: OrderStatus[]
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulate order fetching
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock order data
      const mockOrder: OrderDetails = {
        id: orderId,
        orderNumber: orderId,
        status: 'shipped',
        items: [
          {
            id: '1',
            name: 'iPhone 15 Pro Max 256GB Natural Titanium',
            image: '/images/iphone-15-pro.jpg',
            quantity: 1,
            price: 159900
          },
          {
            id: '2',
            name: 'Apple AirPods Pro (2nd Generation)',
            image: '/images/airpods-pro.jpg',
            quantity: 1,
            price: 24900
          }
        ],
        total: 184800,
        paymentMethod: 'UPI',
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phone: '+91 98765 43210'
        },
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        trackingNumber: `TRK${orderId.slice(-8)}`,
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Order placed successfully'
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Order confirmed and being prepared'
          },
          {
            status: 'shipped',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Mumbai Sorting Facility',
            description: 'Package shipped from warehouse'
          }
        ]
      }
      
      setOrder(mockOrder)
      setLoading(false)
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-500" />
      case 'delivered':
        return <Package className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Confirmed</Badge>
      case 'shipped':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Shipped</Badge>
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-600">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order?.orderNumber || '')
    toast({
      title: "Order Number Copied",
      description: "Order number has been copied to clipboard.",
    })
  }

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(order?.trackingNumber || '')
    toast({
      title: "Tracking Number Copied",
      description: "Tracking number has been copied to clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find an order with ID: {orderId}
            </p>
            <Button onClick={() => router.push('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600">Track your order status and delivery details</p>
            </div>
          </div>

          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status
                </CardTitle>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{order.orderNumber}</span>
                      <Button size="sm" variant="ghost" onClick={copyOrderNumber}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tracking Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{order.trackingNumber}</span>
                        <Button size="sm" variant="ghost" onClick={copyTrackingNumber}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Delivery:</span>
                    <span className="text-sm">{order.estimatedDelivery}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Method:</span>
                    <span className="text-sm">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((status, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(status.status)}
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{status.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(status.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{status.description}</p>
                      {status.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{status.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => router.push('/products')} className="flex-1">
              Continue Shopping
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
