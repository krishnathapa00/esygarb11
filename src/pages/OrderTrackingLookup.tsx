import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Search } from 'lucide-react';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const OrderTrackingLookup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');

  // Fetch user's orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            products (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup': return 'bg-purple-100 text-purple-800';
      case 'dispatched': return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrackOrder = (orderId: string) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleSearchOrder = () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Enter Order Number",
        description: "Please enter an order number to search",
        variant: "destructive"
      });
      return;
    }

    const foundOrder = orders.find(order => 
      order.order_number.toLowerCase().includes(orderNumber.toLowerCase())
    );

    if (foundOrder) {
      navigate(`/order-tracking/${foundOrder.id}`);
    } else {
      toast({
        title: "Order Not Found",
        description: "No order found with this number",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Tracking</h1>
            <p className="text-muted-foreground">Track your orders here</p>
          </div>
        </div>

        {/* Search Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track by Order Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number (e.g., ORD123...)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
              />
              <Button onClick={handleSearchOrder}>
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found</p>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items?.length || 0} items • Rs {parseFloat(String(order.total_amount)).toFixed(2)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        Track Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingLookup;