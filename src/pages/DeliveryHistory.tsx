import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package, ArrowLeft, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const DeliveryHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['delivery-history', user?.id],
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
          ),
          delivery_earnings (
            amount,
            delivery_time_minutes
          )
        `)
        .eq('delivery_partner_id', user?.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const formatTime = (minutes: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateDeliveryTime = (order: any) => {
    if (order.accepted_at && order.delivered_at) {
      const acceptedTime = new Date(order.accepted_at);
      const deliveredTime = new Date(order.delivered_at);
      const diffInMinutes = Math.floor((deliveredTime.getTime() - acceptedTime.getTime()) / 60000);
      return diffInMinutes;
    }
    return null;
  };

  const totalEarnings = orders.reduce((sum, order) => {
    const earning = order.delivery_earnings?.[0];
    return sum + (earning ? Number(earning.amount) : 0);
  }, 0);

  const totalDeliveries = orders.length;
  const averageDeliveryTime = orders.reduce((sum, order) => {
    const time = calculateDeliveryTime(order);
    return sum + (time || 0);
  }, 0) / (totalDeliveries || 1);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/delivery-partner/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Delivery History</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(Math.round(averageDeliveryTime))}</div>
            <p className="text-xs text-muted-foreground">
              Average time per delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed deliveries yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your completed deliveries will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const earning = order.delivery_earnings?.[0];
                const deliveryTime = calculateDeliveryTime(order);
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {order.delivery_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Delivered: {order.delivered_at ? format(new Date(order.delivered_at), 'MMM dd, yyyy - hh:mm a') : 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Delivered
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Order Value</p>
                        <p className="font-medium">₹{order.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earned</p>
                        <p className="font-medium text-green-600">
                          ₹{earning ? Number(earning.amount).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery Time</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {deliveryTime ? formatTime(deliveryTime) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{order.order_items?.length || 0} items</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="text-sm text-muted-foreground">
                              {item.quantity}x {item.products?.name} - ₹{item.price}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryHistory;