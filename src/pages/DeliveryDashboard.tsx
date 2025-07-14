import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, LogOut, Package, MapPin, Phone, Timer, Clock, CheckCircle, User, Power, DollarSign, Navigation } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  // Fetch delivery partner profile for online status
  const { data: profile } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

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

  // Fetch available orders for assignment (when online)
  const { data: availableOrders } = useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .is('delivery_partner_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      return orders || [];
    },
    enabled: isOnline && !!user
  });

  // Fetch current active order
  const { data: currentOrder } = useQuery({
    queryKey: ['current-order', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('delivery_partner_id', user.id)
        .in('status', ['confirmed', 'dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return orders?.[0] || null;
    },
    enabled: !!user
  });

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: user?.id,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['current-order'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Order Accepted!",
        description: "You have successfully accepted the order."
      });
    }
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
      queryClient.invalidateQueries({ queryKey: ['current-order'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully."
      });
    }
  });

  const handleStatusUpdate = (orderId: string, status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    updateOrderStatus.mutate({ orderId, status });
  };

  const handleAcceptOrder = (orderId: string) => {
    acceptOrderMutation.mutate(orderId);
  };

  const toggleAvailability = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "Going Offline" : "Going Online",
      description: isOnline ? "You will not receive new orders" : "You are now available for orders"
    });
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/delivery-auth');
  };

  const getEstimatedPayout = (orderAmount: number) => {
    return (orderAmount * 0.15).toFixed(2); // 15% of order value
  };

  useEffect(() => {
    if (!user) {
      navigate('/delivery-auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">डिलिभरी पार्टनर</h1>
                <p className="text-xs text-muted-foreground">Delivery Partner</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Availability Toggle */}
              <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2 rounded-xl border border-border/50 backdrop-blur-sm">
                <Power className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium text-foreground">
                  {isOnline ? 'अनलाइन' : 'अफलाइन'}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={toggleAvailability}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/delivery-profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/order-history')}
              >
                <Timer className="h-4 w-4 mr-2" />
                History
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/support')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Support
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                आजका डिलिभरी
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.todayDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today's deliveries</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                आजको आम्दानी
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">रू{(stats?.todayEarnings || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Today's earnings</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Power className="h-4 w-4" />
                स्थिति
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'} text-sm px-3 py-1`}>
                {isOnline ? 'अनलाइन' : 'अफलाइन'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{isOnline ? 'Online' : 'Offline'}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                प्रोफाइल
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">
                {profile?.role === 'delivery_partner' ? 'स्वीकृत' : 'पेंडिंग'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {profile?.role === 'delivery_partner' ? 'Approved' : 'Pending'}
              </p>
            </CardContent>
          </Card>
        </div>

        {!isOnline ? (
          /* Offline Status */
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Power className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">तपाईं अफलाइन हुनुहुन्छ</h3>
                <p className="text-muted-foreground mb-6 text-lg">अर्डर प्राप्त गर्न उपलब्धता खोल्नुहोस्</p>
                <Button 
                  onClick={toggleAvailability} 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                >
                  <Power className="h-5 w-5 mr-2" />
                  अनलाइन जानुहोस्
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentOrder ? (
          /* Active Order Management */
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                सक्रिय अर्डर
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{currentOrder.order_number}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: {currentOrder.profiles?.full_name || 'N/A'}
                      </p>
                       <p className="text-sm text-gray-600">
                         Amount: रू{Number(currentOrder.total_amount).toFixed(2)}
                       </p>
                       <p className="text-sm text-gray-600">
                         Estimated Payout: रू{getEstimatedPayout(Number(currentOrder.total_amount))}
                       </p>
                    </div>
                    <Badge className={
                      currentOrder.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                      currentOrder.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                      currentOrder.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {currentOrder.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Delivery Address:</span>
                      <span>{currentOrder.delivery_address}</span>
                    </div>
                    
                    {currentOrder.profiles?.phone_number && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Customer Phone:</span>
                        <span>{currentOrder.profiles.phone_number}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {currentOrder.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'dispatched')}
                        disabled={updateOrderStatus.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        En Route to Pickup
                      </Button>
                    )}
                    
                    {currentOrder.status === 'dispatched' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'out_for_delivery')}
                        disabled={updateOrderStatus.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Picked Up
                      </Button>
                    )}
                    
                    {currentOrder.status === 'out_for_delivery' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'delivered')}
                        disabled={updateOrderStatus.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Delivered
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrder.delivery_address)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (currentOrder.profiles?.phone_number) {
                          window.open(`tel:${currentOrder.profiles.phone_number}`, '_self');
                        }
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Order Assignment */
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                उपलब्ध अर्डरहरू
              </CardTitle>
              <p className="text-sm text-muted-foreground">तपाईंको क्षेत्रमा नयाँ अर्डर अनुरोधहरू</p>
            </CardHeader>
            <CardContent>
              {availableOrders && availableOrders.length > 0 ? (
                <div className="space-y-4">
                  {availableOrders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-600">
                            Customer: {order.profiles?.full_name || 'N/A'}
                          </p>
                           <p className="text-sm text-gray-600">
                             Order Value: रू{Number(order.total_amount).toFixed(2)}
                           </p>
                           <p className="text-sm font-medium text-green-700">
                             Estimated Payout: रू{getEstimatedPayout(Number(order.total_amount))}
                           </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          NEW ORDER
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{order.delivery_address}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={acceptOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Order
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Order Rejected",
                              description: "Order has been rejected"
                            });
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No new orders available at the moment</p>
                  <p className="text-sm text-gray-400 mt-2">Stay online to receive new orders</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;