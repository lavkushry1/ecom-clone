'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Target,
  TrendingUp,
  Users,
  ShoppingCart,
  Percent,
  Gift,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  value: number;
  code: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  targetAudience: 'all' | 'new_users' | 'returning_users' | 'vip_users';
  applicableProducts: string[];
  applicableCategories: string[];
  analytics: {
    views: number;
    redemptions: number;
    revenue: number;
    conversionRate: number;
  };
}

interface AdvancedOfferManagementProps {
  className?: string;
}

export function AdvancedOfferManagement({ className }: AdvancedOfferManagementProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Mock data - in production, this would come from Firebase
  useEffect(() => {
    const mockOffers: Offer[] = [
      {
        id: 'offer_001',
        title: 'Welcome Discount',
        description: '20% off on your first order',
        type: 'percentage',
        value: 20,
        code: 'WELCOME20',
        minOrderValue: 500,
        maxDiscount: 1000,
        usageLimit: 1000,
        usageCount: 234,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
        targetAudience: 'new_users',
        applicableProducts: [],
        applicableCategories: ['electronics', 'fashion'],
        analytics: {
          views: 1250,
          redemptions: 234,
          revenue: 45600,
          conversionRate: 18.7
        }
      },
      {
        id: 'offer_002',
        title: 'Flash Sale',
        description: 'Flat ₹500 off on orders above ₹2000',
        type: 'fixed',
        value: 500,
        code: 'FLASH500',
        minOrderValue: 2000,
        usageLimit: 500,
        usageCount: 456,
        validFrom: new Date('2024-01-15'),
        validUntil: new Date('2024-01-20'),
        isActive: false,
        targetAudience: 'all',
        applicableProducts: [],
        applicableCategories: [],
        analytics: {
          views: 2340,
          redemptions: 456,
          revenue: 228000,
          conversionRate: 19.5
        }
      },
      {
        id: 'offer_003',
        title: 'Buy One Get One',
        description: 'Buy 1 Get 1 Free on selected items',
        type: 'bogo',
        value: 1,
        code: 'BOGO1',
        usageLimit: 200,
        usageCount: 89,
        validFrom: new Date('2024-01-10'),
        validUntil: new Date('2024-01-25'),
        isActive: true,
        targetAudience: 'returning_users',
        applicableProducts: ['prod_001', 'prod_002'],
        applicableCategories: ['fashion'],
        analytics: {
          views: 890,
          redemptions: 89,
          revenue: 34500,
          conversionRate: 10.0
        }
      },
      {
        id: 'offer_004',
        title: 'Free Shipping Weekend',
        description: 'Free shipping on all orders this weekend',
        type: 'free_shipping',
        value: 0,
        code: 'FREESHIP',
        minOrderValue: 299,
        usageCount: 678,
        validFrom: new Date('2024-01-13'),
        validUntil: new Date('2024-01-14'),
        isActive: false,
        targetAudience: 'all',
        applicableProducts: [],
        applicableCategories: [],
        analytics: {
          views: 3450,
          redemptions: 678,
          revenue: 123400,
          conversionRate: 19.7
        }
      }
    ];

    setTimeout(() => {
      setOffers(mockOffers);
      setFilteredOffers(mockOffers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = offers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        offer =>
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(offer => {
        switch (statusFilter) {
          case 'active':
            return offer.isActive && offer.validFrom <= now && offer.validUntil >= now;
          case 'expired':
            return offer.validUntil < now;
          case 'scheduled':
            return offer.validFrom > now;
          case 'inactive':
            return !offer.isActive;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(offer => offer.type === typeFilter);
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, statusFilter, typeFilter]);

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <TrendingUp className="h-4 w-4" />;
      case 'bogo':
        return <Gift className="h-4 w-4" />;
      case 'free_shipping':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getOfferStatusBadge = (offer: Offer) => {
    const now = new Date();
    
    if (!offer.isActive) {
      return <Badge variant="outline" className="text-gray-600">Inactive</Badge>;
    }
    
    if (offer.validFrom > now) {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    }
    
    if (offer.validUntil < now) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getUsageProgress = (offer: Offer) => {
    if (!offer.usageLimit) return 100;
    return Math.min((offer.usageCount / offer.usageLimit) * 100, 100);
  };

  const getTotalStats = () => {
    return filteredOffers.reduce(
      (acc, offer) => ({
        totalViews: acc.totalViews + offer.analytics.views,
        totalRedemptions: acc.totalRedemptions + offer.analytics.redemptions,
        totalRevenue: acc.totalRevenue + offer.analytics.revenue,
        avgConversionRate: acc.avgConversionRate + offer.analytics.conversionRate
      }),
      { totalViews: 0, totalRedemptions: 0, totalRevenue: 0, avgConversionRate: 0 }
    );
  };

  const stats = getTotalStats();
  const avgConversionRate = filteredOffers.length > 0 ? stats.avgConversionRate / filteredOffers.length : 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Advanced Offer Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Create, manage, and analyze promotional offers
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </div>
        </CardHeader>

        {/* Stats Overview */}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Total Views</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalViews.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Redemptions</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.totalRedemptions.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600">Revenue Generated</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">Avg Conversion</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{avgConversionRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search Offers</Label>
              <Input
                id="search"
                placeholder="Search by title, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="scheduled">Scheduled</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label htmlFor="type">Offer Type</Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="bogo">Buy One Get One</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600 mb-4">
                No offers match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Offer
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Offer Details */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getOfferTypeIcon(offer.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            {getOfferStatusBadge(offer)}
                            <Badge variant="outline" className="text-xs">
                              {offer.targetAudience.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Offer Code and Value */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-600">Offer Code</span>
                          <p className="font-mono text-sm font-medium">{offer.code}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">Value</span>
                          <p className="font-medium">
                            {offer.type === 'percentage' && `${offer.value}% OFF`}
                            {offer.type === 'fixed' && `₹${offer.value} OFF`}
                            {offer.type === 'bogo' && `Buy ${offer.value} Get ${offer.value} Free`}
                            {offer.type === 'free_shipping' && 'FREE SHIPPING'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {offer.validFrom.toLocaleDateString()} - {offer.validUntil.toLocaleDateString()}
                      </div>
                      {offer.minOrderValue && (
                        <div>Min Order: ₹{offer.minOrderValue}</div>
                      )}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
                    <div className="space-y-3">
                      {offer.usageLimit && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Usage</span>
                            <span>{offer.usageCount} / {offer.usageLimit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getUsageProgress(offer)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Views</span>
                          <p className="font-medium">{offer.analytics.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversion</span>
                          <p className="font-medium">{offer.analytics.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Redemptions</span>
                          <span className="font-medium">{offer.analytics.redemptions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-medium">₹{offer.analytics.revenue.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
