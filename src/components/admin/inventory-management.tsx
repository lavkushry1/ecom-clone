'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Package, TrendingDown, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  price: number;
  value: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inStockProducts: number;
  totalValue: number;
}

interface StockUpdateForm {
  productId: string;
  quantity: number;
  operation: 'set' | 'increment' | 'decrement';
  reason: string;
  notes: string;
}

interface RestockRequestForm {
  productId: string;
  requestedQuantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

export default function InventoryManagement() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockUpdateForm, setStockUpdateForm] = useState<StockUpdateForm>({
    productId: '',
    quantity: 0,
    operation: 'set',
    reason: '',
    notes: ''
  });
  const [restockForm, setRestockForm] = useState<RestockRequestForm>({
    productId: '',
    requestedQuantity: 0,
    priority: 'medium',
    notes: ''
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchInventoryReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      const result = await response.json();
      
      if (result.success) {
        setInventoryData(result.data.products);
        setStats(result.data.summary);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch inventory data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryReport();
  }, [fetchInventoryReport]);

  const handleStockUpdate = useCallback(async () => {
    try {
      if (!stockUpdateForm.productId || stockUpdateForm.quantity <= 0) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStock',
          ...stockUpdateForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Stock updated successfully'
        });
        setStockUpdateForm({
          productId: '',
          quantity: 0,
          operation: 'set',
          reason: '',
          notes: ''
        });
        fetchInventoryReport();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update stock',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive'
      });
    }
  }, [stockUpdateForm, toast, fetchInventoryReport]);

  const handleRestockRequest = async () => {
    try {
      if (!restockForm.productId || restockForm.requestedQuantity <= 0) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createRestockRequest',
          ...restockForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Restock request created successfully'
        });
        setRestockForm({
          productId: '',
          requestedQuantity: 0,
          priority: 'medium',
          notes: ''
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create restock request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating restock request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create restock request',
        variant: 'destructive'
      });
    }
  };

  const handleBulkStockUpdate = async () => {
    try {
      if (selectedProducts.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select products to update',
          variant: 'destructive'
        });
        return;
      }

      const updates = selectedProducts.map(productId => ({
        productId,
        quantity: stockUpdateForm.quantity,
        operation: stockUpdateForm.operation
      }));

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkUpdateStock',
          updates,
          reason: stockUpdateForm.reason
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Updated ${result.data.totalUpdated} products successfully`
        });
        setSelectedProducts([]);
        fetchInventoryReport();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to bulk update stock',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk update stock',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Low Stock</Badge>;
      case 'in-stock':
        return <Badge variant="default" className="flex items-center gap-1"><Package className="w-3 h-3" />In Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="update-stock">Update Stock</TabsTrigger>
          <TabsTrigger value="restock-requests">Restock Requests</TabsTrigger>
          <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>Monitor stock levels and product availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Threshold</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">{item.stock}</td>
                        <td className="p-2">{item.threshold}</td>
                        <td className="p-2">₹{item.value.toLocaleString()}</td>
                        <td className="p-2">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Update Stock Tab */}
        <TabsContent value="update-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Product Stock</CardTitle>
              <CardDescription>Modify stock levels for individual products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-select">Select Product</Label>
                  <Select value={stockUpdateForm.productId} onValueChange={(value) => 
                    setStockUpdateForm(prev => ({ ...prev, productId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Current: {item.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select value={stockUpdateForm.operation} onValueChange={(value: 'set' | 'increment' | 'decrement') => 
                    setStockUpdateForm(prev => ({ ...prev, operation: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set to</SelectItem>
                      <SelectItem value="increment">Add</SelectItem>
                      <SelectItem value="decrement">Subtract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={stockUpdateForm.quantity}
                    onChange={(e) => setStockUpdateForm(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={stockUpdateForm.reason}
                    onChange={(e) => setStockUpdateForm(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }))}
                    placeholder="e.g., Inventory count, Damaged goods"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={stockUpdateForm.notes}
                    onChange={(e) => setStockUpdateForm(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <Button onClick={handleStockUpdate} className="w-full">
                Update Stock
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restock Requests Tab */}
        <TabsContent value="restock-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Restock Request</CardTitle>
              <CardDescription>Request new inventory for out-of-stock or low-stock products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restock-product">Select Product</Label>
                  <Select value={restockForm.productId} onValueChange={(value) => 
                    setRestockForm(prev => ({ ...prev, productId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData.filter(item => item.status !== 'in-stock').map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.status.replace('-', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requested-quantity">Requested Quantity</Label>
                  <Input
                    id="requested-quantity"
                    type="number"
                    min="1"
                    value={restockForm.requestedQuantity}
                    onChange={(e) => setRestockForm(prev => ({ 
                      ...prev, 
                      requestedQuantity: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={restockForm.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setRestockForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restock-notes">Notes (Optional)</Label>
                  <Input
                    id="restock-notes"
                    value={restockForm.notes}
                    onChange={(e) => setRestockForm(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <Button onClick={handleRestockRequest} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Restock Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk-operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Stock Operations</CardTitle>
              <CardDescription>Update stock for multiple products simultaneously</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Products</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {inventoryData.map((item) => (
                      <label key={item.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => [...prev, item.id]);
                            } else {
                              setSelectedProducts(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                        />
                        <span className="text-sm">{item.name} (Stock: {item.stock})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-operation">Operation</Label>
                    <Select value={stockUpdateForm.operation} onValueChange={(value: 'set' | 'increment' | 'decrement') => 
                      setStockUpdateForm(prev => ({ ...prev, operation: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set to</SelectItem>
                        <SelectItem value="increment">Add</SelectItem>
                        <SelectItem value="decrement">Subtract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-quantity">Quantity</Label>
                    <Input
                      id="bulk-quantity"
                      type="number"
                      min="0"
                      value={stockUpdateForm.quantity}
                      onChange={(e) => setStockUpdateForm(prev => ({ 
                        ...prev, 
                        quantity: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-reason">Reason</Label>
                    <Input
                      id="bulk-reason"
                      value={stockUpdateForm.reason}
                      onChange={(e) => setStockUpdateForm(prev => ({ 
                        ...prev, 
                        reason: e.target.value 
                      }))}
                      placeholder="Bulk update reason"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBulkStockUpdate} 
                  className="w-full"
                  disabled={selectedProducts.length === 0}
                >
                  Update {selectedProducts.length} Selected Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
