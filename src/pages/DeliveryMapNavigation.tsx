import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  Package,
  Navigation,
  CheckCircle,
  Truck,
  Play,
  Pause
} from 'lucide-react';

const DeliveryMapNavigation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
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

  // Timer effects
  useEffect(() => {
    const savedTimer = localStorage.getItem(`delivery_timer_${orderId}`);
    const savedTimerRunning = localStorage.getItem(`delivery_timer_running_${orderId}`);
    
    if (savedTimer) {
      setTimer(parseInt(savedTimer));
    }
    
    if (savedTimerRunning === 'true') {
      setIsTimerRunning(true);
    }
    
    // Auto-start timer when order is out for delivery
    if (order?.status === 'out_for_delivery' && !savedTimerRunning) {
      setIsTimerRunning(true);
      localStorage.setItem(`delivery_timer_running_${orderId}`, 'true');
    }
  }, [orderId, order?.status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          localStorage.setItem(`delivery_timer_${orderId}`, newTime.toString());
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, orderId]);

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      const updates: any = { status };
      
      if (status === 'out_for_delivery') {
        updates.picked_up_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Add to status history
      if (orderId) {
        await supabase
          .from('order_status_history')
          .insert({
            order_id: orderId,
            status: status as 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup',
            notes: notes || `Status updated to ${status}`
          });
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
      
      if (status === 'out_for_delivery') {
        setIsTimerRunning(true);
        localStorage.setItem(`delivery_timer_running_${orderId}`, 'true');
        toast({
          title: "Order Picked Up",
          description: "Timer started. Navigate to customer location.",
        });
      } else if (status === 'delivered') {
        setIsTimerRunning(false);
        localStorage.removeItem(`delivery_timer_${orderId}`);
        localStorage.removeItem(`delivery_timer_running_${orderId}`);
        
        // Show success modal
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 400px; text-align: center; margin: 1rem;">
              <div style="color: #10b981; font-size: 4rem; margin-bottom: 1rem;">✓</div>
              <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #1f2937;">Order Delivered Successfully!</h2>
              <p style="color: #6b7280; margin-bottom: 2rem;">Great job! The order has been marked as delivered.</p>
              <button id="backToDashboard" style="background: #10b981; color: white; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; width: 100%;">
                Back to Dashboard
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('backToDashboard')?.addEventListener('click', () => {
          document.body.removeChild(modal);
          navigate('/delivery-partner/dashboard');
        });
      }
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  });

  const handlePickup = () => {
    updateOrderMutation.mutate({ 
      status: 'out_for_delivery', 
      notes: 'Order picked up by delivery partner' 
    });
  };

  const handleDelivered = () => {
    const deliveryTimeMinutes = Math.floor(timer / 60);
    updateOrderMutation.mutate({ 
      status: 'delivered', 
      notes: `Order delivered in ${deliveryTimeMinutes} minutes` 
    });
  };

  const openMap = () => {
    if (order?.delivery_address) {
      const encodedAddress = encodeURIComponent(order.delivery_address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/delivery-partner/dashboard')}>
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
            <h1 className="text-xl font-bold">Order Navigation</h1>
            <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Timer Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Delivery Timer</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {formatTime(timer)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsTimerRunning(!isTimerRunning);
                    localStorage.setItem(`delivery_timer_running_${orderId}`, (!isTimerRunning).toString());
                  }}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.status === 'dispatched' && (
                <Button 
                  onClick={handlePickup}
                  disabled={updateOrderMutation.isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              
              {order.status === 'out_for_delivery' && (
                <Button 
                  onClick={handleDelivered}
                  disabled={updateOrderMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
              
              <Button 
                onClick={openMap}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.profiles?.full_name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${order.profiles?.phone_number}`}
                className="text-blue-600 hover:underline"
              >
                {order.profiles?.phone_number}
              </a>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <span className="text-sm">{order.delivery_address}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openMap}
                  className="mt-2 w-full"
                >
                  View Exact Location on Map
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
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-medium">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>Rs {parseFloat(order.total_amount?.toString() || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryMapNavigation;