'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Mail, Phone, MapPin, Calendar, UserCheck, UserX, Package, DollarSign, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdvancedSkeleton } from '@/components/ui/advanced-skeleton';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  joinDate: Date;
  lastOrderDate: Date | null;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  averageOrderValue: number;
  favoriteCategories: string[];
  notes: string;
}

interface CustomerOrder {
  id: string;
  date: Date;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  averageOrderValue: number;
  topSpenders: Customer[];
  recentSignups: Customer[];
}

interface CustomerManagementProps {
  className?: string;
}

export function CustomerManagement({ className }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const { toast } = useToast();

  // Simulated data - replace with actual API calls
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCustomers: Customer[] = [
          {
            id: 'cust_001',
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '+91 98765 43210',
            address: {
              street: '123 MG Road',
              city: 'Bangalore',
              state: 'Karnataka',
              zipCode: '560001',
              country: 'India'
            },
            joinDate: new Date('2023-01-15'),
            lastOrderDate: new Date('2024-01-10'),
            totalOrders: 45,
            totalSpent: 125000,
            status: 'active',
            loyaltyTier: 'gold',
            averageOrderValue: 2777,
            favoriteCategories: ['Electronics', 'Fashion'],
            notes: 'VIP customer, prefers express delivery'
          },
          {
            id: 'cust_002',
            name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '+91 87654 32109',
            address: {
              street: '456 Park Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              country: 'India'
            },
            joinDate: new Date('2023-03-20'),
            lastOrderDate: new Date('2024-01-08'),
            totalOrders: 28,
            totalSpent: 78000,
            status: 'active',
            loyaltyTier: 'silver',
            averageOrderValue: 2785,
            favoriteCategories: ['Fashion', 'Beauty'],
            notes: ''
          },
          {
            id: 'cust_003',
            name: 'Amit Patel',
            email: 'amit.patel@email.com',
            phone: '+91 76543 21098',
            address: {
              street: '789 Ring Road',
              city: 'Ahmedabad',
              state: 'Gujarat',
              zipCode: '380001',
              country: 'India'
            },
            joinDate: new Date('2023-06-10'),
            lastOrderDate: new Date('2023-12-15'),
            totalOrders: 12,
            totalSpent: 35000,
            status: 'inactive',
            loyaltyTier: 'bronze',
            averageOrderValue: 2916,
            favoriteCategories: ['Electronics'],
            notes: 'Inactive for 30+ days'
          },
          {
            id: 'cust_004',
            name: 'Sneha Reddy',
            email: 'sneha.reddy@email.com',
            phone: '+91 65432 10987',
            address: {
              street: '321 Tech City',
              city: 'Hyderabad',
              state: 'Telangana',
              zipCode: '500001',
              country: 'India'
            },
            joinDate: new Date('2024-01-05'),
            lastOrderDate: new Date('2024-01-12'),
            totalOrders: 3,
            totalSpent: 8500,
            status: 'active',
            loyaltyTier: 'bronze',
            averageOrderValue: 2833,
            favoriteCategories: ['Home & Kitchen'],
            notes: 'New customer'
          },
          {
            id: 'cust_005',
            name: 'Vikram Singh',
            email: 'vikram.singh@email.com',
            phone: '+91 54321 09876',
            address: {
              street: '654 Civil Lines',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110001',
              country: 'India'
            },
            joinDate: new Date('2022-08-12'),
            lastOrderDate: new Date('2024-01-11'),
            totalOrders: 87,
            totalSpent: 250000,
            status: 'active',
            loyaltyTier: 'platinum',
            averageOrderValue: 2873,
            favoriteCategories: ['Electronics', 'Sports'],
            notes: 'Platinum member, highest spender'
          }
        ];

        const mockStats: CustomerStats = {
          totalCustomers: 1247,
          activeCustomers: 892,
          newThisMonth: 156,
          averageOrderValue: 2845,
          topSpenders: mockCustomers.slice(0, 3),
          recentSignups: mockCustomers.slice(-3)
        };

        setCustomers(mockCustomers);
        setStats(mockStats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  // Filter customers based on search and filters
  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesTier = tierFilter === 'all' || customer.loyaltyTier === tierFilter;
      
      return matchesSearch && matchesStatus && matchesTier;
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, tierFilter]);

  const fetchCustomerOrders = async (customerId: string) => {
    // Simulate fetching customer orders
    const mockOrders: CustomerOrder[] = [
      {
        id: 'ORD_001',
        date: new Date('2024-01-10'),
        total: 2500,
        status: 'delivered',
        items: 3
      },
      {
        id: 'ORD_002',
        date: new Date('2024-01-05'),
        total: 1800,
        status: 'shipped',
        items: 2
      },
      {
        id: 'ORD_003',
        date: new Date('2023-12-28'),
        total: 3200,
        status: 'delivered',
        items: 5
      }
    ];
    setCustomerOrders(mockOrders);
  };

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Inactive</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTierBadge = (tier: Customer['loyaltyTier']) => {
    const tierConfig = {
      bronze: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Bronze' },
      silver: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Silver' },
      gold: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Gold' },
      platinum: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Platinum' }
    };
    
    const config = tierConfig[tier];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  };

  const handleStatusUpdate = async (customerId: string, newStatus: Customer['status']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, status: newStatus } : customer
      ));
      
      toast({
        title: "Success",
        description: "Customer status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <AdvancedSkeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage your customer base and track customer analytics
          </p>
        </CardHeader>
        
        {stats && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Total Customers</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Active Customers</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.activeCustomers.toLocaleString()}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600">New This Month</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{stats.newThisMonth.toLocaleString()}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Avg Order Value</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">₹{stats.averageOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {customer.address.city}, {customer.address.state}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{customer.totalOrders}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">₹{customer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(customer.status)}
                    {getTierBadge(customer.loyaltyTier)}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Customer Details - {customer.name}</DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="orders">Orders</TabsTrigger>
                          <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Name</Label>
                                  <p className="text-sm text-gray-700">{customer.name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <p className="text-sm text-gray-700">{customer.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Phone</Label>
                                  <p className="text-sm text-gray-700">{customer.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Join Date</Label>
                                  <p className="text-sm text-gray-700">{customer.joinDate.toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(customer.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Loyalty Tier</Label>
                                  <div className="mt-1">
                                    {getTierBadge(customer.loyaltyTier)}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Address</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Street</Label>
                                  <p className="text-sm text-gray-700">{customer.address.street}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">City</Label>
                                  <p className="text-sm text-gray-700">{customer.address.city}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">State</Label>
                                  <p className="text-sm text-gray-700">{customer.address.state}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">ZIP Code</Label>
                                  <p className="text-sm text-gray-700">{customer.address.zipCode}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Country</Label>
                                  <p className="text-sm text-gray-700">{customer.address.country}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Shopping Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                  <p className="text-lg font-semibold text-blue-700">{customer.totalOrders}</p>
                                  <p className="text-xs text-blue-600">Total Orders</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                  <p className="text-lg font-semibold text-green-700">₹{customer.totalSpent.toLocaleString()}</p>
                                  <p className="text-xs text-green-600">Total Spent</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                  <p className="text-lg font-semibold text-purple-700">₹{customer.averageOrderValue.toLocaleString()}</p>
                                  <p className="text-xs text-purple-600">Avg Order Value</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                  <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                                  <p className="text-lg font-semibold text-orange-700">
                                    {customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : 'Never'}
                                  </p>
                                  <p className="text-xs text-orange-600">Last Order</p>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Label className="text-sm font-medium">Favorite Categories</Label>
                                <div className="flex gap-2 mt-2">
                                  {customer.favoriteCategories.map((category) => (
                                    <Badge key={category} variant="outline">{category}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {customer.notes && (
                                <div className="mt-4">
                                  <Label className="text-sm font-medium">Notes</Label>
                                  <p className="text-sm text-gray-700 mt-1">{customer.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleStatusUpdate(customer.id, customer.status === 'blocked' ? 'active' : 'blocked')}
                            >
                              {customer.status === 'blocked' ? (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Unblock Customer
                                </>
                              ) : (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Block Customer
                                </>
                              )}
                            </Button>
                            <Button variant="outline">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="orders" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Order History</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {customerOrders.map((order) => (
                                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                      <p className="font-medium">{order.id}</p>
                                      <p className="text-sm text-gray-600">{order.date.toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="font-medium">₹{order.total.toLocaleString()}</p>
                                      <p className="text-sm text-gray-600">{order.items} items</p>
                                    </div>
                                    <Badge 
                                      className={
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="analytics" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Purchase Patterns</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Most Active Day</span>
                                    <span className="text-sm font-medium">Saturday</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Preferred Payment</span>
                                    <span className="text-sm font-medium">UPI</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Return Rate</span>
                                    <span className="text-sm font-medium">2.3%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Customer Since</span>
                                    <span className="text-sm font-medium">
                                      {Math.floor((Date.now() - customer.joinDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Engagement Score</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-green-600 mb-2">8.5/10</div>
                                  <p className="text-sm text-gray-600">High Engagement</p>
                                  <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Order Frequency</span>
                                      <span>9/10</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Spending Consistency</span>
                                      <span>8/10</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Return Rate</span>
                                      <span>9/10</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No customers found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
