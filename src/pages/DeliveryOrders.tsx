import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const DeliveryOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], refetch } = useQuery({
    queryKey: ['delivery-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
        .in('status', ['ready_for_pickup', 'confirmed', 'dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_partner_id: user?.id,
        status: 'dispatched',
        accepted_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('status', 'ready_for_pickup'); // Only accept if still available

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept order. It may have been taken by another partner.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Order Accepted",
      description: "Navigate to the order details to start delivery.",
      variant: "default"
    });

    refetch();
    navigate(`/delivery-partner/navigate/${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const availableOrders = orders.filter(order => order.status === 'ready_for_pickup');
  const myOrders = orders.filter(order => order.delivery_partner_id === user?.id);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" onClick={() => navigate('/delivery-partner/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Available Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Orders ({availableOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders available at the moment</p>
          ) : (
            availableOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {order.delivery_address}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p className="font-medium">Total: Rs {order.total_amount}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.estimated_delivery}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => acceptOrder(order.id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Order Passed",
                          description: "You have passed on this order.",
                        });
                      }}
                    >
                      Pass
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* My Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Active Orders ({myOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {myOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">You have no active orders</p>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {order.delivery_address}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p className="font-medium">Total: Rs {order.total_amount}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.estimated_delivery}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/delivery-partner/navigate/${order.id}`)}
                  >
                    Navigate
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryOrders;