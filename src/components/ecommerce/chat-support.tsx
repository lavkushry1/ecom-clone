'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Phone, Mail, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatSupportProps {
  className?: string;
}

export function ChatSupport({ className }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot' as const,
      content: 'Hi! I\'m here to help you. How can I assist you today?',
      timestamp: new Date(Date.now() - 1000)
    }
  ]);

  const quickActions = [
    { label: 'Track Order', action: 'track_order' },
    { label: 'Return Item', action: 'return_item' },
    { label: 'Payment Issue', action: 'payment_issue' },
    { label: 'Product Query', action: 'product_query' }
  ];

  const supportOptions = [
    {
      icon: Phone,
      label: 'Call Support',
      description: '1800-XXX-XXXX',
      action: () => window.open('tel:1800XXXXXXX')
    },
    {
      icon: Mail,
      label: 'Email Support',
      description: 'support@example.com',
      action: () => window.open('mailto:support@example.com')
    },
    {
      icon: Headphones,
      label: 'Live Chat',
      description: 'Available 24/7',
      action: () => setIsOpen(true)
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: getBotResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      track_order: 'I need help tracking my order',
      return_item: 'I want to return an item',
      payment_issue: 'I have a payment related issue',
      product_query: 'I have a question about a product'
    };

    setMessage(actionMessages[action] || action);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('track') || lowercaseMessage.includes('order')) {
      return 'I can help you track your order! Please provide your order ID (e.g., ORD-2024-001) and I\'ll get the latest status for you.';
    } else if (lowercaseMessage.includes('return') || lowercaseMessage.includes('refund')) {
      return 'I understand you want to return an item. Our return policy allows returns within 30 days. Would you like me to start the return process for you?';
    } else if (lowercaseMessage.includes('payment') || lowercaseMessage.includes('charge')) {
      return 'I can help with payment issues. Could you please describe what specific payment problem you\'re experiencing?';
    } else if (lowercaseMessage.includes('delivery') || lowercaseMessage.includes('shipping')) {
      return 'For delivery related queries, I can provide shipping updates and estimated delivery times. What\'s your order number?';
    } else {
      return 'Thanks for your message! I\'m connecting you with our support team. In the meantime, you can also call us at 1800-XXX-XXXX for immediate assistance.';
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
            size="sm"
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </Button>
          
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2">
            <Badge className="h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
              1
            </Badge>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Need help? Chat with us!
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 md:w-96 md:h-[500px]">
          <Card className="h-full flex flex-col shadow-2xl border-0 bg-white">
            {/* Header */}
            <CardHeader className="flex-row items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Customer Support</CardTitle>
                  <p className="text-xs text-blue-100">Usually responds in a few minutes</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                    <div
                      className={`text-xs mt-1 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Support Options */}
              <div className="flex gap-1 mt-2">
                {supportOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={option.action}
                  >
                    <option.icon className="h-3 w-3 mr-1" />
                    {option.label.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
