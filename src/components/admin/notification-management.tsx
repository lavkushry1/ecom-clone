'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Send, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  createdAt: string;
  sentAt?: string;
  error?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables: string[];
}

interface SendNotificationForm {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject: string;
  message: string;
  templateId?: string;
}

interface BulkNotificationForm {
  type: 'email' | 'sms' | 'push';
  recipients: string[];
  subject: string;
  message: string;
  templateId?: string;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendForm, setSendForm] = useState<SendNotificationForm>({
    type: 'email',
    recipient: '',
    subject: '',
    message: '',
    templateId: ''
  });
  const [bulkForm, setBulkForm] = useState<BulkNotificationForm>({
    type: 'email',
    recipients: [],
    subject: '',
    message: '',
    templateId: ''
  });
  const [recipientInput, setRecipientInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    loadTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=50');
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications || []);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch notifications',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = () => {
    // Default notification templates
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'order-confirmation',
        name: 'Order Confirmation',
        type: 'email',
        subject: 'Order Confirmation - #{orderId}',
        content: 'Thank you for your order! Your order #{orderId} has been confirmed and will be processed shortly.',
        variables: ['orderId', 'customerName', 'totalAmount']
      },
      {
        id: 'order-shipped',
        name: 'Order Shipped',
        type: 'email',
        subject: 'Your order has been shipped - #{orderId}',
        content: 'Great news! Your order #{orderId} has been shipped and is on its way. Tracking number: {trackingNumber}',
        variables: ['orderId', 'trackingNumber', 'estimatedDelivery']
      },
      {
        id: 'low-stock-alert',
        name: 'Low Stock Alert',
        type: 'email',
        subject: 'Low Stock Alert - {productName}',
        content: 'Alert: {productName} is running low in stock. Current quantity: {currentStock}',
        variables: ['productName', 'currentStock', 'threshold']
      },
      {
        id: 'welcome-sms',
        name: 'Welcome SMS',
        type: 'sms',
        content: 'Welcome to our store! Thank you for joining us. Start shopping now and get exclusive offers.',
        variables: ['customerName']
      },
      {
        id: 'order-delivered',
        name: 'Order Delivered',
        type: 'push',
        content: 'Your order #{orderId} has been delivered! We hope you love your purchase.',
        variables: ['orderId', 'customerName']
      }
    ];
    setTemplates(defaultTemplates);
  };

  const handleSendNotification = async () => {
    try {
      if (!sendForm.recipient || !sendForm.message) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      if (sendForm.type === 'email' && !sendForm.subject) {
        toast({
          title: 'Error',
          description: 'Email subject is required',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendNotification',
          ...sendForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Notification sent successfully'
        });
        setSendForm({
          type: 'email',
          recipient: '',
          subject: '',
          message: '',
          templateId: ''
        });
        fetchNotifications();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send notification',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive'
      });
    }
  };

  const handleBulkNotification = async () => {
    try {
      if (bulkForm.recipients.length === 0 || !bulkForm.message) {
        toast({
          title: 'Error',
          description: 'Please add recipients and message',
          variant: 'destructive'
        });
        return;
      }

      if (bulkForm.type === 'email' && !bulkForm.subject) {
        toast({
          title: 'Error',
          description: 'Email subject is required',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendBulkNotification',
          ...bulkForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Bulk notification sent to ${bulkForm.recipients.length} recipients`
        });
        setBulkForm({
          type: 'email',
          recipients: [],
          subject: '',
          message: '',
          templateId: ''
        });
        fetchNotifications();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send bulk notification',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send bulk notification',
        variant: 'destructive'
      });
    }
  };

  const addRecipient = () => {
    if (recipientInput && !bulkForm.recipients.includes(recipientInput)) {
      setBulkForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput]
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (recipient: string) => {
    setBulkForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== recipient)
    }));
  };

  const loadTemplate = (templateId: string, formType: 'single' | 'bulk') => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (formType === 'single') {
        setSendForm(prev => ({
          ...prev,
          type: template.type,
          subject: template.subject || '',
          message: template.content,
          templateId
        }));
      } else {
        setBulkForm(prev => ({
          ...prev,
          type: template.type,
          subject: template.subject || '',
          message: template.content,
          templateId
        }));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-600">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Management Tabs */}
      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Send</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Send Single Notification */}
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>Send a notification to a single recipient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select value={sendForm.type} onValueChange={(value: 'email' | 'sms' | 'push') => 
                    setSendForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-select">Use Template (Optional)</Label>
                  <Select value={sendForm.templateId} onValueChange={(value) => 
                    value ? loadTemplate(value, 'single') : setSendForm(prev => ({ ...prev, templateId: '' }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.type === sendForm.type).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder={sendForm.type === 'email' ? 'email@example.com' : sendForm.type === 'sms' ? '+1234567890' : 'user_id'}
                  />
                </div>

                {sendForm.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={sendForm.subject}
                      onChange={(e) => setSendForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={sendForm.message}
                    onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message here..."
                    rows={4}
                  />
                </div>
              </div>

              <Button onClick={handleSendNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Send */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Notification</CardTitle>
              <CardDescription>Send notifications to multiple recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-type">Notification Type</Label>
                  <Select value={bulkForm.type} onValueChange={(value: 'email' | 'sms' | 'push') => 
                    setBulkForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-template">Use Template (Optional)</Label>
                  <Select value={bulkForm.templateId} onValueChange={(value) => 
                    value ? loadTemplate(value, 'bulk') : setBulkForm(prev => ({ ...prev, templateId: '' }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.type === bulkForm.type).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {bulkForm.type === 'email' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bulk-subject">Subject</Label>
                    <Input
                      id="bulk-subject"
                      value={bulkForm.subject}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bulk-message">Message</Label>
                  <Textarea
                    id="bulk-message"
                    value={bulkForm.message}
                    onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message here..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-recipient">Add Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      id="add-recipient"
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      placeholder={bulkForm.type === 'email' ? 'email@example.com' : bulkForm.type === 'sms' ? '+1234567890' : 'user_id'}
                      onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <Button onClick={addRecipient} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                {bulkForm.recipients.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Recipients ({bulkForm.recipients.length})</Label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                      {bulkForm.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{recipient}</span>
                          <Button
                            onClick={() => removeRecipient(recipient)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleBulkNotification} 
                className="w-full"
                disabled={bulkForm.recipients.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Send to {bulkForm.recipients.length} Recipients
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View all sent notifications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Recipient</th>
                      <th className="text-left p-2">Subject/Message</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </td>
                        <td className="p-2">{notification.recipient}</td>
                        <td className="p-2">
                          <div className="max-w-xs">
                            {notification.subject && (
                              <div className="font-medium text-sm">{notification.subject}</div>
                            )}
                            <div className="text-sm text-gray-600 truncate">
                              {notification.message}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(notification.status)}
                            {getStatusBadge(notification.status)}
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(notification.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No notifications found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Pre-defined message templates for common notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          <Badge variant="outline" className="capitalize">
                            {template.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {template.subject && (
                        <div>
                          <Label className="text-xs text-gray-500">Subject</Label>
                          <p className="text-sm font-medium">{template.subject}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs text-gray-500">Content</Label>
                        <p className="text-sm">{template.content}</p>
                      </div>
                      {template.variables.length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-500">Variables</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {`{${variable}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
