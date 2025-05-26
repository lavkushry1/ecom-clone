'use client';

import React, { useState, useEffect } from 'react';
import { Save, Settings, CreditCard, Truck, Globe, Shield, Bell, Palette, Code, Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AdvancedSkeleton } from '@/components/ui/advanced-skeleton';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  currency: string;
  timezone: string;
  language: string;
}

interface PaymentSettings {
  upiId: string;
  merchantName: string;
  paymentMethods: {
    upi: boolean;
    cards: boolean;
    netBanking: boolean;
    wallets: boolean;
    cod: boolean;
  };
  minimumOrderValue: number;
  codCharges: number;
  paymentGateway: string;
  testMode: boolean;
}

interface ShippingSettings {
  zones: ShippingZone[];
  freeShippingThreshold: number;
  defaultShippingRate: number;
  expressShippingRate: number;
  shippingCalculation: 'flat' | 'weight' | 'zone';
  estimatedDeliveryDays: {
    standard: number;
    express: number;
  };
}

interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  rate: number;
  estimatedDays: number;
}

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  enableSitemap: boolean;
  enableRobots: boolean;
}

interface NotificationSettings {
  emailNotifications: {
    newOrder: boolean;
    orderStatusUpdate: boolean;
    lowStock: boolean;
    customerSignup: boolean;
  };
  smsNotifications: {
    orderConfirmation: boolean;
    shippingUpdates: boolean;
    deliveryConfirmation: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newOffers: boolean;
    orderUpdates: boolean;
  };
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAttempts: number;
  sessionTimeout: number;
  ipWhitelist: string[];
  enableAuditLog: boolean;
}

interface SettingsManagementProps {
  className?: string;
}

export function SettingsManagement({ className }: SettingsManagementProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const { toast } = useToast();

  // Load all settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API calls
        setStoreSettings({
          storeName: 'Flipkart Clone',
          storeDescription: 'Your one-stop shop for all your needs',
          storeEmail: 'support@flipkart.com',
          storePhone: '+91 1800 123 4567',
          storeAddress: {
            street: '123 Tech Street',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          language: 'en'
        });

        setPaymentSettings({
          upiId: 'merchant@paytm',
          merchantName: 'Flipkart',
          paymentMethods: {
            upi: true,
            cards: true,
            netBanking: false,
            wallets: true,
            cod: true
          },
          minimumOrderValue: 299,
          codCharges: 40,
          paymentGateway: 'razorpay',
          testMode: true
        });

        setShippingSettings({
          zones: [
            {
              id: 'zone_1',
              name: 'Metro Cities',
              states: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'],
              rate: 40,
              estimatedDays: 2
            },
            {
              id: 'zone_2',
              name: 'Tier 2 Cities',
              states: ['Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'],
              rate: 60,
              estimatedDays: 4
            },
            {
              id: 'zone_3',
              name: 'Remote Areas',
              states: ['Assam', 'Manipur', 'Nagaland', 'Tripura'],
              rate: 100,
              estimatedDays: 7
            }
          ],
          freeShippingThreshold: 499,
          defaultShippingRate: 50,
          expressShippingRate: 150,
          shippingCalculation: 'zone',
          estimatedDeliveryDays: {
            standard: 5,
            express: 2
          }
        });

        setSeoSettings({
          metaTitle: 'Flipkart Clone - Online Shopping Store',
          metaDescription: 'Shop online for electronics, fashion, home & kitchen products with fast delivery',
          metaKeywords: 'online shopping, ecommerce, electronics, fashion, home',
          googleAnalyticsId: 'GA-XXXXXXXXX',
          googleTagManagerId: 'GTM-XXXXXXX',
          facebookPixelId: '',
          enableSitemap: true,
          enableRobots: true
        });

        setNotificationSettings({
          emailNotifications: {
            newOrder: true,
            orderStatusUpdate: true,
            lowStock: true,
            customerSignup: false
          },
          smsNotifications: {
            orderConfirmation: true,
            shippingUpdates: true,
            deliveryConfirmation: true
          },
          pushNotifications: {
            enabled: false,
            newOffers: false,
            orderUpdates: false
          }
        });

        setSecuritySettings({
          twoFactorAuth: false,
          loginAttempts: 5,
          sessionTimeout: 30,
          ipWhitelist: [],
          enableAuditLog: true
        });

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveSettings = async (settingsType: string, data: any) => {
    setSaving(settingsType);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: `${settingsType} settings saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${settingsType} settings`,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <AdvancedSkeleton
          type="form"
          fields={6}
          className="h-96"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure your store settings, payments, shipping, and more
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {storeSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeEmail">Store Email</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={storeSettings.storeEmail}
                        onChange={(e) => setStoreSettings({...storeSettings, storeEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Textarea
                      id="storeDescription"
                      value={storeSettings.storeDescription}
                      onChange={(e) => setStoreSettings({...storeSettings, storeDescription: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storePhone">Store Phone</Label>
                      <Input
                        id="storePhone"
                        value={storeSettings.storePhone}
                        onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={storeSettings.currency} onValueChange={(value) => setStoreSettings({...storeSettings, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={storeSettings.timezone} onValueChange={(value) => setStoreSettings({...storeSettings, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={storeSettings.language} onValueChange={(value) => setStoreSettings({...storeSettings, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Store Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Street Address"
                        value={storeSettings.storeAddress.street}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          storeAddress: {...storeSettings.storeAddress, street: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="City"
                        value={storeSettings.storeAddress.city}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          storeAddress: {...storeSettings.storeAddress, city: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="State"
                        value={storeSettings.storeAddress.state}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          storeAddress: {...storeSettings.storeAddress, state: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="ZIP Code"
                        value={storeSettings.storeAddress.zipCode}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          storeAddress: {...storeSettings.storeAddress, zipCode: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('Store', storeSettings)}
                    disabled={saving === 'Store'}
                  >
                    {saving === 'Store' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Store Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        value={paymentSettings.upiId}
                        onChange={(e) => setPaymentSettings({...paymentSettings, upiId: e.target.value})}
                        placeholder="merchant@paytm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="merchantName">Merchant Name</Label>
                      <Input
                        id="merchantName"
                        value={paymentSettings.merchantName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, merchantName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Methods</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                      {Object.entries(paymentSettings.paymentMethods).map(([method, enabled]) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox
                            id={method}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              setPaymentSettings({
                                ...paymentSettings,
                                paymentMethods: {
                                  ...paymentSettings.paymentMethods,
                                  [method]: checked as boolean
                                }
                              })
                            }
                          />
                          <Label htmlFor={method} className="text-sm capitalize">
                            {method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minimumOrderValue">Minimum Order Value</Label>
                      <Input
                        id="minimumOrderValue"
                        type="number"
                        value={paymentSettings.minimumOrderValue}
                        onChange={(e) => setPaymentSettings({...paymentSettings, minimumOrderValue: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="codCharges">COD Charges</Label>
                      <Input
                        id="codCharges"
                        type="number"
                        value={paymentSettings.codCharges}
                        onChange={(e) => setPaymentSettings({...paymentSettings, codCharges: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentGateway">Payment Gateway</Label>
                      <Select value={paymentSettings.paymentGateway} onValueChange={(value) => setPaymentSettings({...paymentSettings, paymentGateway: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="payu">PayU</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="testMode"
                      checked={paymentSettings.testMode}
                      onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, testMode: checked as boolean})}
                    />
                    <Label htmlFor="testMode">Enable Test Mode</Label>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {paymentSettings.testMode ? 'Test Mode Active' : 'Live Mode'}
                    </Badge>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('Payment', paymentSettings)}
                    disabled={saving === 'Payment'}
                  >
                    {saving === 'Payment' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Payment Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shippingSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="freeShippingThreshold">Free Shipping Above</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultShippingRate">Default Shipping Rate</Label>
                      <Input
                        id="defaultShippingRate"
                        type="number"
                        value={shippingSettings.defaultShippingRate}
                        onChange={(e) => setShippingSettings({...shippingSettings, defaultShippingRate: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expressShippingRate">Express Shipping Rate</Label>
                      <Input
                        id="expressShippingRate"
                        type="number"
                        value={shippingSettings.expressShippingRate}
                        onChange={(e) => setShippingSettings({...shippingSettings, expressShippingRate: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shippingCalculation">Shipping Calculation Method</Label>
                    <Select value={shippingSettings.shippingCalculation} onValueChange={(value: any) => setShippingSettings({...shippingSettings, shippingCalculation: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Rate</SelectItem>
                        <SelectItem value="weight">Weight Based</SelectItem>
                        <SelectItem value="zone">Zone Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="standardDelivery">Standard Delivery (Days)</Label>
                      <Input
                        id="standardDelivery"
                        type="number"
                        value={shippingSettings.estimatedDeliveryDays.standard}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          estimatedDeliveryDays: {
                            ...shippingSettings.estimatedDeliveryDays,
                            standard: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expressDelivery">Express Delivery (Days)</Label>
                      <Input
                        id="expressDelivery"
                        type="number"
                        value={shippingSettings.estimatedDeliveryDays.express}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          estimatedDeliveryDays: {
                            ...shippingSettings.estimatedDeliveryDays,
                            express: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Shipping Zones</Label>
                    <div className="space-y-3 mt-2">
                      {shippingSettings.zones.map((zone) => (
                        <div key={zone.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{zone.name}</h4>
                            <Badge variant="outline">₹{zone.rate}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            States: {zone.states.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Estimated Delivery: {zone.estimatedDays} days
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('Shipping', shippingSettings)}
                    disabled={saving === 'Shipping'}
                  >
                    {saving === 'Shipping' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Shipping Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                SEO & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seoSettings && (
                <>
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={seoSettings.metaTitle}
                      onChange={(e) => setSeoSettings({...seoSettings, metaTitle: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={seoSettings.metaKeywords}
                      onChange={(e) => setSeoSettings({...seoSettings, metaKeywords: e.target.value})}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={seoSettings.googleAnalyticsId}
                        onChange={(e) => setSeoSettings({...seoSettings, googleAnalyticsId: e.target.value})}
                        placeholder="GA-XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                      <Input
                        id="googleTagManagerId"
                        value={seoSettings.googleTagManagerId}
                        onChange={(e) => setSeoSettings({...seoSettings, googleTagManagerId: e.target.value})}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixelId"
                        value={seoSettings.facebookPixelId}
                        onChange={(e) => setSeoSettings({...seoSettings, facebookPixelId: e.target.value})}
                        placeholder="1234567890123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableSitemap"
                        checked={seoSettings.enableSitemap}
                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, enableSitemap: checked as boolean})}
                      />
                      <Label htmlFor="enableSitemap">Enable XML Sitemap</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableRobots"
                        checked={seoSettings.enableRobots}
                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, enableRobots: checked as boolean})}
                      />
                      <Label htmlFor="enableRobots">Enable robots.txt</Label>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('SEO', seoSettings)}
                    disabled={saving === 'SEO'}
                  >
                    {saving === 'SEO' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save SEO Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings && (
                <>
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <div className="space-y-3 mt-3">
                      {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`email-${key}`}
                            checked={value}
                            onCheckedChange={(checked) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: {
                                  ...notificationSettings.emailNotifications,
                                  [key]: checked as boolean
                                }
                              })
                            }
                          />
                          <Label htmlFor={`email-${key}`} className="text-sm">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">SMS Notifications</Label>
                    <div className="space-y-3 mt-3">
                      {Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sms-${key}`}
                            checked={value}
                            onCheckedChange={(checked) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                smsNotifications: {
                                  ...notificationSettings.smsNotifications,
                                  [key]: checked as boolean
                                }
                              })
                            }
                          />
                          <Label htmlFor={`sms-${key}`} className="text-sm">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="push-enabled"
                          checked={notificationSettings.pushNotifications.enabled}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNotifications: {
                                ...notificationSettings.pushNotifications,
                                enabled: checked as boolean
                              }
                            })
                          }
                        />
                        <Label htmlFor="push-enabled" className="text-sm font-medium">
                          Enable Push Notifications
                        </Label>
                      </div>
                      
                      {notificationSettings.pushNotifications.enabled && (
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="push-offers"
                              checked={notificationSettings.pushNotifications.newOffers}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({
                                  ...notificationSettings,
                                  pushNotifications: {
                                    ...notificationSettings.pushNotifications,
                                    newOffers: checked as boolean
                                  }
                                })
                              }
                            />
                            <Label htmlFor="push-offers" className="text-sm">New Offers</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="push-orders"
                              checked={notificationSettings.pushNotifications.orderUpdates}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({
                                  ...notificationSettings,
                                  pushNotifications: {
                                    ...notificationSettings.pushNotifications,
                                    orderUpdates: checked as boolean
                                  }
                                })
                              }
                            />
                            <Label htmlFor="push-orders" className="text-sm">Order Updates</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('Notifications', notificationSettings)}
                    disabled={saving === 'Notifications'}
                  >
                    {saving === 'Notifications' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked as boolean})}
                    />
                    <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                    <Badge className={securitySettings.twoFactorAuth ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                      {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAuditLog"
                      checked={securitySettings.enableAuditLog}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enableAuditLog: checked as boolean})}
                    />
                    <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Security Recommendations</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Enable two-factor authentication for admin accounts</li>
                      <li>• Regularly update passwords and review access logs</li>
                      <li>• Use strong, unique passwords for all accounts</li>
                      <li>• Monitor login attempts and unusual activity</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('Security', securitySettings)}
                    disabled={saving === 'Security'}
                  >
                    {saving === 'Security' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
