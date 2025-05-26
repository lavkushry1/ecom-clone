'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  EyeOff, 
  CreditCard, 
  Download, 
  Filter,
  Search,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface StoredCardDetails {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  cardNumber: string; // Encrypted in real implementation
  expiryDate: string;
  cvv: string; // Encrypted in real implementation
  zipCode: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  paymentMethod: string;
  riskScore?: number;
}

interface AdminCardDetailsProps {
  className?: string;
}

export function AdminCardDetails({ className }: AdminCardDetailsProps) {
  const [cardDetails, setCardDetails] = useState<StoredCardDetails[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<StoredCardDetails[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7days');
  const [loading, setLoading] = useState(true);

  // Mock data - In real implementation, this would come from Firebase with proper encryption
  useEffect(() => {
    const mockCardDetails: StoredCardDetails[] = [
      {
        id: 'card_001',
        orderId: 'ORD-2024-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        cardNumber: '****-****-****-1234', // Masked
        expiryDate: '12/26',
        cvv: '***', // Masked
        zipCode: '10001',
        amount: 1299,
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        paymentMethod: 'Visa',
        riskScore: 12
      },
      {
        id: 'card_002',
        orderId: 'ORD-2024-002',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah.w@email.com',
        cardNumber: '****-****-****-5678',
        expiryDate: '09/25',
        cvv: '***',
        zipCode: '90210',
        amount: 2450,
        status: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        paymentMethod: 'Mastercard',
        riskScore: 8
      },
      {
        id: 'card_003',
        orderId: 'ORD-2024-003',
        customerName: 'Mike Johnson',
        customerEmail: 'mike.j@email.com',
        cardNumber: '****-****-****-9012',
        expiryDate: '03/27',
        cvv: '***',
        zipCode: '60601',
        amount: 890,
        status: 'failed',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        paymentMethod: 'American Express',
        riskScore: 45
      },
      {
        id: 'card_004',
        orderId: 'ORD-2024-004',
        customerName: 'Emily Davis',
        customerEmail: 'emily.d@email.com',
        cardNumber: '****-****-****-3456',
        expiryDate: '07/28',
        cvv: '***',
        zipCode: '73301',
        amount: 3200,
        status: 'pending',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        paymentMethod: 'Visa',
        riskScore: 23
      }
    ];

    setTimeout(() => {
      setCardDetails(mockCardDetails);
      setFilteredDetails(mockCardDetails);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = cardDetails;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        detail =>
          detail.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(detail => detail.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === '24hours') {
      filtered = filtered.filter(detail => 
        now.getTime() - detail.timestamp.getTime() <= 24 * 60 * 60 * 1000
      );
    } else if (dateFilter === '7days') {
      filtered = filtered.filter(detail => 
        now.getTime() - detail.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000
      );
    }

    setFilteredDetails(filtered);
  }, [cardDetails, searchTerm, statusFilter, dateFilter]);

  const toggleSensitiveData = (cardId: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const exportData = () => {
    const exportData = filteredDetails.map(detail => ({
      ...detail,
      cardNumber: showSensitiveData[detail.id] ? detail.cardNumber : '****-****-****-XXXX',
      cvv: showSensitiveData[detail.id] ? detail.cvv : '***'
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `card-details-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore <= 20) {
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    } else if (riskScore <= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
    }
  };

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
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Stored Card Details
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Secure access to payment information (Demo purposes only)
            </p>
          </div>
          <Button onClick={exportData} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, email, order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <Label htmlFor="date">Time Period</Label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Card Details List */}
        <div className="space-y-4">
          {filteredDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No card details found matching your filters.
            </div>
          ) : (
            filteredDetails.map((detail) => (
              <Card key={detail.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Name:</span> {detail.customerName}</p>
                        <p><span className="text-gray-600">Email:</span> {detail.customerEmail}</p>
                        <p><span className="text-gray-600">Order ID:</span> {detail.orderId}</p>
                        <p><span className="text-gray-600">Amount:</span> ₹{detail.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Card:</span>
                          <span className="font-mono">
                            {showSensitiveData[detail.id] ? '4532-1234-5678-1234' : detail.cardNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSensitiveData(detail.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showSensitiveData[detail.id] ? 
                              <EyeOff className="h-3 w-3" /> : 
                              <Eye className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                        <p><span className="text-gray-600">Expiry:</span> {detail.expiryDate}</p>
                        <p><span className="text-gray-600">CVV:</span> 
                          <span className="font-mono ml-1">
                            {showSensitiveData[detail.id] ? '123' : detail.cvv}
                          </span>
                        </p>
                        <p><span className="text-gray-600">ZIP:</span> {detail.zipCode}</p>
                        <p><span className="text-gray-600">Type:</span> {detail.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Status & Risk */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Transaction Status</h4>
                      <div className="space-y-2">
                        {getStatusBadge(detail.status)}
                        {detail.riskScore && getRiskBadge(detail.riskScore)}
                        <p className="text-sm text-gray-600">
                          {detail.timestamp.toLocaleString()}
                        </p>
                        {detail.riskScore && (
                          <p className="text-xs text-gray-500">
                            Risk Score: {detail.riskScore}/100
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-600">{filteredDetails.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Successful</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredDetails.filter(d => d.status === 'success').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredDetails.filter(d => d.status === 'failed').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{filteredDetails.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-yellow-800">Security Notice</h5>
              <p className="text-sm text-yellow-700 mt-1">
                This is a demo component. In production, sensitive payment data must be properly encrypted, 
                PCI DSS compliant, and access should be strictly controlled with audit logs.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
