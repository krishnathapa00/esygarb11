import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Clock, CreditCard, CheckCircle, Truck, Timer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useOrderTimer } from '@/hooks/useOrderTimer';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch order data with delivery config
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const [orderResponse, configResponse] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            profiles!orders_user_id_fkey ( full_name, phone_number, address ),
            order_items ( *, products:product_id ( name, price, image_url ) ),
            delivery_partner:profiles!orders_delivery_partner_id_fkey ( full_name, phone_number )
          `)
          .eq('id', orderId)
          .single(),
        supabase
          .from('delivery_config')
          .select('delivery_fee')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()
      ]);

      if (orderResponse.error) {
        toast({
          title: "Failed to load order",
          description: orderResponse.error.message,
          variant: "destructive"
        });
        return null;
      }

      const deliveryFee = configResponse.data?.delivery_fee || 50;
      return { ...orderResponse.data, delivery_fee: deliveryFee } as any;
    },
    enabled: !!orderId,
    staleTime: 30000, // Cache for 30 seconds for faster loading
    gcTime: 60000     // Keep in cache for 1 minute
  });

  // Order timer for admin tracking
  const orderTimer = useOrderTimer({
    orderId: orderId || '',
    orderStatus: order?.status || 'pending',
    orderCreatedAt: order?.created_at || '',
    acceptedAt: order?.accepted_at,
    deliveredAt: order?.delivered_at
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updateData: any = { status };
      
      if (status === 'ready_for_pickup') {
        // When marking ready, also log to status history
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          status: 'ready_for_pickup',
          notes: 'Order prepared and ready for pickup'
        });
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Order status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Dispatch order to available delivery partners
  const dispatchOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Find an available online delivery partner
      const { data: availablePartners, error: partnerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'delivery_partner')
        .eq('is_online', true)
        .eq('kyc_verified', true);
        
      if (partnerError) throw partnerError;
      
      if (!availablePartners || availablePartners.length === 0) {
        // No partners available, just mark as ready for pickup
        const { error } = await supabase
          .from('orders')
          .update({ status: 'ready_for_pickup' })
          .eq('id', orderId);
          
        if (error) throw error;
        
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          status: 'ready_for_pickup', 
          notes: 'Order dispatched - awaiting delivery partner acceptance'
        });
        
        return { autoAssigned: false };
      }
      
      // Auto-assign to first available partner
      const selectedPartner = availablePartners[0];
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: selectedPartner.id,
          status: 'dispatched',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
        
      if (error) throw error;
      
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status: 'dispatched',
        notes: `Order auto-assigned to ${selectedPartner.full_name}`
      });
      
      return { autoAssigned: true, partnerName: selectedPartner.full_name };
    },
    onSuccess: (result) => {
      if (result.autoAssigned) {
        toast({ 
          title: "Order Dispatched", 
          description: `Order automatically assigned to ${result.partnerName}` 
        });
      } else {
        toast({ 
          title: "Order Ready", 
          description: "Order is now available for delivery partners to accept" 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup': return 'bg-cyan-100 text-cyan-800';
      case 'dispatched': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkReady = () => {
    setIsUpdating(true);
    updateOrderMutation.mutate({ orderId: orderId!, status: 'ready_for_pickup' });
    setIsUpdating(false);
  };

  const handleDispatchOrder = () => {
    setIsUpdating(true);
    dispatchOrderMutation.mutate(orderId!);
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
          <Link to="/admin/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Order Details #{order.order_number}</h1>
              <p className="text-gray-500">Order placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <Button 
                onClick={handleMarkReady}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Ready
              </Button>
            )}
            {order.status === 'ready_for_pickup' && (
              <Button 
                onClick={handleDispatchOrder}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Truck className="h-4 w-4 mr-2" />
                Dispatch Order
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge className={getStatusColor(order.status || 'pending')}>
                      {order.status?.replace('_', ' ') || 'pending'}
                    </Badge>
                  </div>
                  
                  {/* Items Subtotal */}
                  {order.order_items && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Subtotal</span>
                      <span className="font-medium">
                        Rs {order.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Delivery Fee */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">Rs {order.delivery_fee?.toFixed(2) || '50.00'}</span>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-semibold">Total Amount</span>
                    <span className="font-bold text-lg">Rs {order.total_amount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                      {order.payment_status || 'pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span>{order.estimated_delivery || 'N/A'}</span>
                  </div>
                  
                  {/* Timer Display */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        Remaining Time
                      </span>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${orderTimer.isOverdue ? 'text-red-600' : 'text-primary'}`}>
                          {orderTimer.formatRemaining()}
                        </span>
                        {orderTimer.isOverdue && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time Elapsed</span>
                      <span>{orderTimer.formatElapsed()}</span>
                    </div>
                    {order.status === 'delivered' && order.delivery_time_minutes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Delivery Time</span>
                        <span className="font-medium">{Math.floor(order.delivery_time_minutes)} minutes</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      <img 
                        src={item.products?.image_url || '/placeholder.svg'} 
                        alt={item.products?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.products?.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600">Name</span>
                  <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone</span>
                  <p className="font-medium">{order.profiles?.phone_number || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.delivery_address}</p>
              </CardContent>
            </Card>

            {/* Delivery Partner */}
            {order.delivery_partner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Delivery Partner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-600">Name</span>
                    <p className="font-medium">{order.delivery_partner.full_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone</span>
                    <p className="font-medium">{order.delivery_partner.phone_number}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order Placed</span>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  {order.updated_at !== order.created_at && (
                    <div className="flex justify-between text-sm">
                      <span>Last Updated</span>
                      <span>{new Date(order.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails;