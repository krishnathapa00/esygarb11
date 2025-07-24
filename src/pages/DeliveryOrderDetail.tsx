import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, MapPin, Navigation, Clock, Truck, Phone } from 'lucide-react';

interface OrderWithDetails {
  id: string;
  order_number: string;
  total_amount: number;
  delivery_address: string;
  status: string;
  created_at: string;
  estimated_delivery: string;
  profiles: {
    full_name: string;
    phone_number: string;
  } | null;
  order_items: Array<{
    quantity: number;
    price: number;
    products?: {
      name: string;
    };
  }>;
}

const DeliveryOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deliveryTimer, setDeliveryTimer] = useState(600); // 10 minutes

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['delivery-order-detail', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number),
          order_items(quantity, price, products(name))
        `)
        .eq('id', orderId)
        .eq('delivery_partner_id', user?.id)
        .single();
      
      if (error) throw error;
      return data as OrderWithDetails;
    },
    enabled: !!orderId && !!user,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Timer countdown effect
  useEffect(() => {
    if (order?.status === 'out_for_delivery') {
      const timer = setInterval(() => {
        setDeliveryTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [order?.status]);

  // Update order status mutation
  const updateStatus = useMutation({
    mutationFn: async (newStatus: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup') => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
        order_id: orderId,
        status: newStatus,
        notes: `Status updated to ${newStatus} by delivery partner`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['current-order'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully."
      });
    }
  });

  const handleStatusUpdate = (status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup') => {
    updateStatus.mutate(status);
  };

  const handleNavigate = () => {
    if (order?.delivery_address) {
      const address = encodeURIComponent(order.delivery_address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">This order doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/delivery-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/delivery-dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Order Details</h1>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order #{order.order_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {order.profiles?.full_name}</p>
                  <p><strong>Phone:</strong> {order.profiles?.phone_number}</p>
                  <p><strong>Order Total:</strong> Rs {order.total_amount}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Delivery Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Address:</strong> {order.delivery_address}</p>
                  <p><strong>Estimated:</strong> {order.estimated_delivery}</p>
                  <p><strong>Order Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">Order Items</h4>
              <div className="bg-muted/50 rounded-lg p-3">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm">{item.products?.name || 'Product'}</span>
                    <span className="text-sm">
                      {item.quantity}x Rs {item.price} = Rs {item.quantity * item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer Card - Show when out for delivery */}
        {order.status === 'out_for_delivery' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-orange-800 mb-1">Delivery Timer</h3>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {formatTime(deliveryTimer)}
                </div>
                <p className="text-orange-700 text-sm">
                  Expected delivery time remaining
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Navigation Button */}
          <Button
            onClick={handleNavigate}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Navigation className="h-5 w-5 mr-2" />
            Navigate to Customer Location
          </Button>

          {/* Contact Customer */}
          <Button
            onClick={() => window.open(`tel:${order.profiles?.phone_number}`, '_self')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Customer: {order.profiles?.phone_number}
          </Button>

          {/* Status Update Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {order.status === 'confirmed' && (
              <Button
                onClick={() => handleStatusUpdate('dispatched')}
                disabled={updateStatus.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Picked Up
              </Button>
            )}
            
            {(order.status === 'dispatched' || order.status === 'confirmed') && (
              <Button
                onClick={() => handleStatusUpdate('out_for_delivery')}
                disabled={updateStatus.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                In Route
              </Button>
            )}
            
            {(order.status === 'out_for_delivery' || order.status === 'dispatched') && (
              <Button
                onClick={() => handleStatusUpdate('delivered')}
                disabled={updateStatus.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Delivered
              </Button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2">Delivery Instructions</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Follow the navigation to reach the customer's location</p>
              <p>• Call the customer if you need help finding the address</p>
              <p>• Update the status as you progress with the delivery</p>
              <p>• Confirm delivery only after handing over the order</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryOrderDetail;