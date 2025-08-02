import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Phone, MapPin, Clock, Package, Navigation, Play, Pause, Square } from 'lucide-react';

const DeliveryMapNavigation = () => {
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
          profiles!orders_user_id_fkey(
            full_name,
            phone_number
          ),
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
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  // Save timer state to localStorage for persistence
  useEffect(() => {
    const savedTimer = localStorage.getItem(`delivery_timer_${orderId}`);
    const savedStatus = localStorage.getItem(`delivery_status_${orderId}`);
    
    if (savedTimer && savedStatus === 'running') {
      const startTime = parseInt(savedTimer);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsed);
      setIsTimerRunning(true);
    }
  }, [orderId]);

  // Timer effect with localStorage persistence
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Auto-start timer if order is out_for_delivery
  useEffect(() => {
    if (order && order.status === 'out_for_delivery' && !isTimerRunning) {
      const savedTimer = localStorage.getItem(`delivery_timer_${orderId}`);
      if (!savedTimer) {
        // Start timer for the first time
        const startTime = Date.now();
        localStorage.setItem(`delivery_timer_${orderId}`, startTime.toString());
        localStorage.setItem(`delivery_status_${orderId}`, 'running');
        setIsTimerRunning(true);
      }
    }
  }, [order, orderId, isTimerRunning]);

  const updateOrderMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'out_for_delivery') {
        updateData.picked_up_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Log status change with correct column name
      const { error: logError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: status as any,
          notes: notes || `Status updated to ${status}`
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
    }
  });

  const handlePickup = () => {
    updateOrderMutation.mutate({ 
      status: 'out_for_delivery',
      notes: 'Order picked up from darkstore'
    });
    
    // Start timer and save to localStorage
    const startTime = Date.now();
    localStorage.setItem(`delivery_timer_${orderId}`, startTime.toString());
    localStorage.setItem(`delivery_status_${orderId}`, 'running');
    setIsTimerRunning(true);
    
    toast({
      title: "Order Picked Up",
      description: "Delivery timer started. Navigate to customer location.",
    });
  };

  const handleDelivered = () => {
    updateOrderMutation.mutate({ 
      status: 'delivered',
      notes: `Order delivered in ${formatTime(timer)}`
    });
    
    // Stop timer and clear localStorage
    setIsTimerRunning(false);
    localStorage.removeItem(`delivery_timer_${orderId}`);
    localStorage.removeItem(`delivery_status_${orderId}`);
    
    toast({
      title: "Order Delivered",
      description: "Great job! Delivery completed successfully.",
    });
    navigate('/delivery-partner/dashboard');
  };

  const openMap = () => {
    const address = order?.delivery_address;
    if (address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="max-w-2xl mx-auto text-center py-12">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/delivery-partner/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/delivery-partner/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Order Navigation</h1>
          <div></div>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-2">Customer Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span>{order.profiles?.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{order.profiles?.phone_number}</span>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:${order.profiles?.phone_number}`)}>
                    Call
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="flex-1">{order.delivery_address}</span>
                  <Button size="sm" variant="outline" onClick={openMap}>
                    <Navigation className="w-4 h-4 mr-1" />
                    Navigate
                  </Button>
                </div>
              </div>
            </div>

            {/* Timer */}
            {isTimerRunning && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {formatTime(timer)}
                  </span>
                </div>
                <p className="text-center text-sm text-orange-700 mt-1">
                  Delivery in progress
                </p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.order_items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{item.quantity}x {item.products?.name}</span>
                    <span className="font-medium">Rs {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-2 bg-green-50 rounded font-semibold">
                  <span>Total Amount</span>
                  <span>Rs {order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t">
              {order.status === 'dispatched' && (
                <Button 
                  onClick={handlePickup}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updateOrderMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              
              {order.status === 'out_for_delivery' && (
                <Button 
                  onClick={handleDelivered}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={updateOrderMutation.isPending}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={openMap}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryMapNavigation;