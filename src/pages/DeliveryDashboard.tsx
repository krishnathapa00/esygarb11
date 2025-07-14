import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, LogOut, Package, MapPin, Phone, Timer, Clock, CheckCircle } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deliveryTimer, setDeliveryTimer] = useState(600); // 10 minutes in seconds
  const [orderStartTime, setOrderStartTime] = useState<string | null>(null);
  const [totalDeliveryTime, setTotalDeliveryTime] = useState<number | null>(null);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDeliveryTimer(prev => {
        if (prev <= 0) {
          toast({
            title: "Delivery Time Alert!",
            description: "Target delivery time has exceeded!",
            variant: "destructive"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [toast]);

  // Fetch delivery partner stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's deliveries
      const { data: todayDeliveries, error: todayError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', today.toISOString());

      // Get all completed deliveries for earnings
      const { data: completedDeliveries, error: completedError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', user.id)
        .eq('status', 'delivered');

      // Get pending orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', user.id)
        .in('status', ['confirmed', 'dispatched', 'out_for_delivery']);

      if (todayError || completedError || pendingError) {
        throw new Error('Failed to fetch stats');
      }

      const todayEarnings = (todayDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.1), 0);
      const totalEarnings = (completedDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.1), 0);

      return {
        todayDeliveries: todayDeliveries?.length || 0,
        todayEarnings,
        totalEarnings,
        pendingOrders: pendingOrders?.length || 0
      };
    },
    enabled: !!user
  });

  // Fetch active orders
  const { data: activeOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['delivery-active-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('delivery_partner_id', user.id)
        .in('status', ['confirmed', 'dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orders || [];
    },
    enabled: !!user
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Insert status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes: `Status updated by delivery partner`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = (orderId: string, status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    updateOrderStatus.mutate({ orderId, status });
    
    // Reset timer and start tracking when picking up order
    if (status === 'out_for_delivery') {
      setDeliveryTimer(600); // Reset to 10 minutes
      setOrderStartTime(new Date().toISOString());
      setTotalDeliveryTime(null);
    }
    
    // Calculate delivery time when order is delivered
    if (status === 'delivered' && orderStartTime) {
      const deliveryTime = Math.floor((new Date().getTime() - new Date(orderStartTime).getTime()) / 1000);
      setTotalDeliveryTime(deliveryTime);
      toast({
        title: "Order Delivered!",
        description: `Total delivery time: ${formatTime(deliveryTime)}`,
      });
      setOrderStartTime(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/delivery-auth');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user) {
      navigate('/delivery-auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                Delivery Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Delivery Timer */}
              <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-lg">
                <Timer className="h-4 w-4 text-red-600" />
                <span className="font-mono text-red-600 font-semibold">
                  {formatTime(deliveryTimer)}
                </span>
                <span className="text-xs text-red-500">Target</span>
              </div>
              
              {/* Active Delivery Time */}
              {orderStartTime && (
                <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-mono text-blue-600 font-semibold">
                    {formatTime(Math.floor((new Date().getTime() - new Date(orderStartTime).getTime()) / 1000))}
                  </span>
                  <span className="text-xs text-blue-500">Active</span>
                </div>
              )}
              
              {/* Last Delivery Time */}
              {totalDeliveryTime && !orderStartTime && (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-mono text-green-600 font-semibold">
                    {formatTime(totalDeliveryTime)}
                  </span>
                  <span className="text-xs text-green-500">Last</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Today's Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayDeliveries || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Today's Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {(stats?.todayEarnings || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {(stats?.totalEarnings || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders && activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          Customer: {order.profiles?.full_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: Rs {Number(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <Badge className={
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{order.delivery_address}</span>
                    </div>
                    
                    {order.profiles?.phone_number && (
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{order.profiles.phone_number}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(order.id, 'dispatched')}
                          disabled={updateOrderStatus.isPending}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Accept Order
                        </Button>
                      )}
                      
                      {order.status === 'dispatched' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                          disabled={updateOrderStatus.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Picked Up
                        </Button>
                      )}
                      
                      {order.status === 'out_for_delivery' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={updateOrderStatus.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Delivered
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (order.profiles?.phone_number) {
                            window.open(`tel:${order.profiles.phone_number}`, '_self');
                          }
                          toast({
                            title: "Customer contacted",
                            description: `Called ${order.profiles?.phone_number || 'customer'}`
                          });
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Customer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active deliveries at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;