
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, Clock, Package, CheckCircle, Navigation } from 'lucide-react';

const DeliveryOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number),
          order_items(*, products(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ status, timestamp_field }: { status: string; timestamp_field?: string }) => {
      const updates: any = { status };
      if (timestamp_field) {
        updates[timestamp_field] = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: id,
          status: status as "pending" | "confirmed" | "dispatched" | "out_for_delivery" | "delivered" | "cancelled" | "ready_for_pickup",
          notes: `Order ${status.replace('_', ' ')} by delivery partner`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
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
    navigate('/delivery/dashboard');
  };

  const openMap = () => {
    if (order?.delivery_address) {
      const address = encodeURIComponent(order.delivery_address);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(mapUrl, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/delivery/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
          <Badge variant="outline">{order.status.replace('_', ' ')}</Badge>
        </div>

        {isTimerRunning && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Delivery Timer</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(timer)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{order.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.profiles?.phone_number}</p>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${order.profiles?.phone_number}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">₹{parseFloat(order.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Time</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{order.delivery_address}</p>
              <Button onClick={openMap} className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.status === 'dispatched' && (
              <Button onClick={handlePickup} className="w-full" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Mark as Picked Up
              </Button>
            )}
            
            {order.status === 'out_for_delivery' && (
              <Button onClick={handleDelivered} className="w-full" size="lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Delivered
              </Button>
            )}

            {order.status === 'delivered' && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Order Delivered Successfully!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryOrderDetail;
