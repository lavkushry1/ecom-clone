'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedOfferManagement } from '@/components/admin/advanced-offer-management'
import { useToast } from '@/hooks/use-toast'
import { DataSeeder } from '@/lib/data-seeder'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Database,
  RefreshCw,
  Target
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: number
  pendingOrders: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  sales: number
}

interface Order {
  id: string
  customer: string
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  date: string
  items: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 156,
    totalOrders: 1247,
    totalCustomers: 892,
    totalRevenue: 2847650,
    recentOrders: 23,
    pendingOrders: 8
  })

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      category: 'Electronics',
      price: 159900,
      stock: 45,
      status: 'active',
      sales: 234
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Electronics',
      price: 139900,
      stock: 32,
      status: 'active',
      sales: 189
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      category: 'Electronics',
      price: 199900,
      stock: 0,
      status: 'inactive',
      sales: 67
    }
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'FK12345678',
      customer: 'John Doe',
      total: 184800,
      status: 'shipped',
      date: '2024-12-25',
      items: 2
    },
    {
      id: 'FK12345679',
      customer: 'Jane Smith',
      total: 67890,
      status: 'pending',
      date: '2024-12-25',
      items: 1
    },
    {
      id: 'FK12345680',
      customer: 'Bob Johnson',
      total: 234567,
      status: 'delivered',
      date: '2024-12-24',
      items: 3
    }
  ])

  const { toast } = useToast()

  const seedData = async () => {
    try {
      await DataSeeder.seedProducts();
      await DataSeeder.seedCategories();
      toast({
        title: 'Success',
        description: 'Seeded products and categories successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to seed data',
        variant: 'destructive'
      });
      console.error(error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
      case 'inactive':
        return <Badge variant="outline" className="text-red-600 border-red-600">Inactive</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Confirmed</Badge>
      case 'shipped':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Shipped</Badge>
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-600">Delivered</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const StatCard = ({ title, value, icon: Icon, subtitle }: {
    title: string
    value: string | number
    icon: any
    subtitle?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-8 h-8 text-flipkart-blue" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your e-commerce store</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon={Package}
                subtitle="Active products in store"
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={ShoppingCart}
                subtitle={`${stats.recentOrders} new today`}
              />
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={Users}
                subtitle="Registered users"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
                icon={TrendingUp}
                subtitle="This month"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Orders
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 3)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.sales} sales</p>
                            <p className="text-sm text-gray-600">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Products
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Management</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Products Table */}
                <div className="space-y-4">
                  {products
                    .filter(product => 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-center min-w-[100px]">
                          <p className="font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                          <p className="text-sm text-gray-600">Price</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="font-medium">{product.stock}</p>
                          <p className="text-sm text-gray-600">Stock</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="font-medium">{product.sales}</p>
                          <p className="text-sm text-gray-600">Sales</p>
                        </div>
                        <div className="text-center min-w-[100px]">
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Management</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {stats.pendingOrders} Pending
                    </Badge>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Orders Table */}
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="font-medium">{order.items}</p>
                        <p className="text-sm text-gray-600">Items</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="font-medium">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                        <p className="text-sm text-gray-600">Date</p>
                      </div>
                      <div className="text-center min-w-[120px]">
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <AdvancedOfferManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">UPI ID</label>
                    <Input placeholder="merchant@paytm" defaultValue="merchant@paytm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Merchant Name</label>
                    <Input placeholder="Flipkart" defaultValue="Flipkart" />
                  </div>
                  <Button>Save Payment Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <Input placeholder="Your Store Name" defaultValue="Flipkart Clone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Support Email</label>
                    <Input placeholder="support@store.com" defaultValue="support@flipkart.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Support Phone</label>
                    <Input placeholder="+91 1800 123 4567" defaultValue="+91 1800 123 4567" />
                  </div>
                  <Button>Save Store Settings</Button>
                </CardContent>
              </Card>
            </div>

            {/* Data Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Sample Data Seeding</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    Populate your store with sample products and categories for testing and demonstration purposes.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          await DataSeeder.seedProducts();
                          toast({
                            title: "Success",
                            description: "Sample products have been seeded successfully!",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to seed products. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Seed Products
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          await DataSeeder.seedCategories();
                          toast({
                            title: "Success", 
                            description: "Sample categories have been seeded successfully!",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to seed categories. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Seed Categories
                    </Button>
                    <Button 
                      onClick={async () => {
                        try {
                          await DataSeeder.seedAll();
                          toast({
                            title: "Success",
                            description: "All sample data has been seeded successfully!",
                          });
                        } catch (error) {
                          toast({
                            title: "Error", 
                            description: "Failed to seed data. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Seed All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
