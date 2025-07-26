import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Phone, MapPin, Clock, Package } from 'lucide-react';

const DeliveryOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number),
          order_items(
            *,
            products(name, image_url, price)
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ status, timestamp_field }: { status: string; timestamp_field: string }) => {
      const updates: any = { status };
      if (timestamp_field) {
        updates[timestamp_field] = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: status as any,
          notes: `Order ${status.replace('_', ' ')} by delivery partner`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handlePickup = () => {
    updateOrderStatusMutation.mutate({ 
      status: 'out_for_delivery', 
      timestamp_field: 'picked_up_at' 
    });
    setIsTimerRunning(true);
  };

  const handleDelivered = () => {
    updateOrderStatusMutation.mutate({ 
      status: 'delivered', 
      timestamp_field: 'delivered_at' 
    });
    setIsTimerRunning(false);
    navigate('/delivery-partner/dashboard');
  };

  const openMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Order not found</p>
            <Button onClick={() => navigate('/delivery-partner/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/delivery-partner/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Timer for Out for Delivery */}
        {order.status === 'out_for_delivery' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  Delivery Timer: {formatTime(timer)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Order Status
              <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.profiles?.full_name}</p>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${order.profiles?.phone_number}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">₹{parseFloat(String(order.total_amount || '0')).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Time</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{order.delivery_address}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => openMap(order.delivery_address)}
                >
                  Open in Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{parseFloat(String(item.price || '0')).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.status === 'dispatched' && (
                <Button 
                  onClick={handlePickup}
                  className="w-full"
                  disabled={updateOrderStatusMutation.isPending}
                >
                  Mark as Picked Up
                </Button>
              )}
              
              {order.status === 'out_for_delivery' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => openMap(order.delivery_address)}
                    className="w-full"
                  >
                    Open Navigation
                  </Button>
                  <Button 
                    onClick={handleDelivered}
                    className="w-full"
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    Mark as Delivered
                  </Button>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium">✓ Order Delivered Successfully</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Delivered on {new Date(order.delivered_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryOrderDetail;