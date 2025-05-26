'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  customers: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  products: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
}

interface SalesData {
  period: string;
  sales: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  category: string;
  image: string;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  value: number;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: { current: 2847650, previous: 2245890, change: 26.8, trend: 'up' },
    orders: { current: 1247, previous: 1089, change: 14.5, trend: 'up' },
    customers: { current: 892, previous: 756, change: 18.0, trend: 'up' },
    products: { current: 156, previous: 148, change: 5.4, trend: 'up' }
  });

  const [salesData] = useState<SalesData[]>([
    { period: 'Mon', sales: 12400, orders: 45 },
    { period: 'Tue', sales: 15600, orders: 52 },
    { period: 'Wed', sales: 18900, orders: 67 },
    { period: 'Thu', sales: 16200, orders: 58 },
    { period: 'Fri', sales: 21800, orders: 78 },
    { period: 'Sat', sales: 25400, orders: 89 },
    { period: 'Sun', sales: 19800, orders: 71 }
  ]);

  const [topProducts] = useState<TopProduct[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      sales: 234,
      revenue: 374766,
      category: 'Electronics',
      image: '/api/placeholder/60/60'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      sales: 189,
      revenue: 264411,
      category: 'Electronics',
      image: '/api/placeholder/60/60'
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      sales: 67,
      revenue: 133933,
      category: 'Electronics',
      image: '/api/placeholder/60/60'
    },
    {
      id: '4',
      name: 'AirPods Pro 2',
      sales: 156,
      revenue: 38844,
      category: 'Electronics',
      image: '/api/placeholder/60/60'
    },
    {
      id: '5',
      name: 'iPad Air M2',
      sales: 98,
      revenue: 58802,
      category: 'Electronics',
      image: '/api/placeholder/60/60'
    }
  ]);

  const [customerSegments] = useState<CustomerSegment[]>([
    { segment: 'New Customers', count: 234, percentage: 26.2, value: 156890 },
    { segment: 'Returning Customers', count: 445, percentage: 49.9, value: 1245670 },
    { segment: 'VIP Customers', count: 123, percentage: 13.8, value: 987650 },
    { segment: 'Inactive Customers', count: 90, percentage: 10.1, value: 45680 }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    change: number;
    trend: 'up' | 'down';
    icon: any;
    format?: 'number' | 'currency';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}%
          </span>
          <span>from last period</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your store performance and customer insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.revenue.current}
          change={analyticsData.revenue.change}
          trend={analyticsData.revenue.trend}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={analyticsData.orders.current}
          change={analyticsData.orders.change}
          trend={analyticsData.orders.trend}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Total Customers"
          value={analyticsData.customers.current}
          change={analyticsData.customers.change}
          trend={analyticsData.customers.trend}
          icon={Users}
        />
        <MetricCard
          title="Total Products"
          value={analyticsData.products.current}
          change={analyticsData.products.change}
          trend={analyticsData.products.trend}
          icon={Package}
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Sales Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Sales Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((day, index) => (
                    <div key={day.period} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{day.period}</div>
                      <div className="flex-1">
                        <Progress 
                          value={(day.sales / Math.max(...salesData.map(d => d.sales))) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(day.sales)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">3.2%</span>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Order Value</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{formatCurrency(2284)}</span>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Retention</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">68.5%</span>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cart Abandonment</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">23.1%</span>
                    <TrendingDown className="h-3 w-3 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Top Performing Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 p-2 rounded-lg border">
                    <div className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(product.sales)} sold</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Customer Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment) => (
                  <div key={segment.segment} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{segment.segment}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(segment.count)} ({segment.percentage}%)
                        </span>
                        <Badge variant="outline">
                          {formatCurrency(segment.value)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={segment.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((day) => (
                    <div key={day.period} className="flex items-center justify-between p-2 rounded">
                      <span className="text-sm font-medium">{day.period}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(day.sales)}</div>
                        <div className="text-xs text-muted-foreground">{day.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product Sales</span>
                    <span className="text-sm font-medium">{formatCurrency(2456780)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shipping Revenue</span>
                    <span className="text-sm font-medium">{formatCurrency(145670)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tax Collected</span>
                    <span className="text-sm font-medium">{formatCurrency(245200)}</span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(2847650)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
