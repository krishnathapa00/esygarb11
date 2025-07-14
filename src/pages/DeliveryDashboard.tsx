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
import { 
  Home, LogOut, Package, MapPin, Phone, Timer, Clock, CheckCircle, 
  User, Power, DollarSign, Navigation, Building, Star, Truck,
  AlertCircle, RefreshCw
} from 'lucide-react';

interface OrderWithProfile {
  id: string;
  order_number: string;
  total_amount: number;
  delivery_address: string;
  status: string;
  created_at: string;
  darkstore_id: number;
  profiles: {
    full_name: string;
    phone_number: string;
  } | null;
  darkstores: {
    name: string;
    address: string;
  } | null;
}

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  // Fetch delivery partner profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          darkstores(name, address)
        `)
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Update online status when toggle changes
  const updateOnlineStatus = useMutation({
    mutationFn: async (online: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: online })
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] });
    }
  });

  // Fetch delivery partner stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's deliveries
      const { data: todayDeliveries } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('delivery_partner_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', today.toISOString());

      // Get all completed deliveries for total earnings
      const { data: completedDeliveries } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('delivery_partner_id', user.id)
        .eq('status', 'delivered');

      // Get pending orders
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('delivery_partner_id', user.id)
        .in('status', ['confirmed', 'dispatched', 'out_for_delivery']);

      const todayEarnings = (todayDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.15), 0);
      const totalEarnings = (completedDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.15), 0);

      return {
        todayDeliveries: todayDeliveries?.length || 0,
        todayEarnings,
        totalEarnings,
        pendingOrders: pendingOrders?.length || 0
      };
    },
    enabled: !!user
  });

  // Fetch available orders for pickup from assigned darkstore
  const { data: availableOrders, refetch: refetchAvailable } = useQuery({
    queryKey: ['available-orders', profile?.darkstore_id],
    queryFn: async () => {
      if (!profile?.darkstore_id) return [];
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number),
          darkstores(name, address)
        `)
        .eq('darkstore_id', parseInt(profile.darkstore_id))
        .is('delivery_partner_id', null)
        .eq('status', 'ready_for_pickup')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return orders || [];
    },
    enabled: !!profile?.darkstore_id && isOnline,
    refetchInterval: 30000 // Refresh every 30 seconds
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
          profiles!orders_user_id_fkey(full_name, phone_number),
          darkstores(name, address)
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

  // Accept/Claim order mutation
  const claimOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: user?.id,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .is('delivery_partner_id', null); // Ensure it hasn't been claimed by someone else

      if (error) throw error;

      // Add status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'confirmed',
          notes: 'Order claimed by delivery partner'
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['current-order'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Order Claimed!",
        description: "You have successfully claimed this order."
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim order",
        description: "This order may have been claimed by another partner.",
        variant: "destructive"
      });
      refetchAvailable();
    }
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup' }) => {
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
          status: status as any,
          notes: `Status updated to ${status} by delivery partner`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-order'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully."
      });
    }
  });

  const handleStatusUpdate = (orderId: string, status: 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup') => {
    updateOrderStatus.mutate({ orderId, status });
  };

  const handleClaimOrder = (orderId: string) => {
    claimOrderMutation.mutate(orderId);
  };

  const toggleAvailability = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    updateOnlineStatus.mutate(newStatus);
    toast({
      title: newStatus ? "Going Online" : "Going Offline",
      description: newStatus ? "You are now available for orders" : "You will not receive new orders"
    });
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/delivery-auth');
  };

  const getEstimatedPayout = (orderAmount: number) => {
    return (orderAmount * 0.15).toFixed(2); // 15% of order value
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dispatched': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/delivery-auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.is_online !== undefined) {
      setIsOnline(profile.is_online);
    }
  }, [profile?.is_online]);

  if (!user || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-foreground">Delivery Partner</h1>
                 <p className="text-xs text-muted-foreground hidden sm:block">
                   {profile?.darkstores ? (Array.isArray(profile.darkstores) ? profile.darkstores[0]?.name : (profile.darkstores as any)?.name) : 'No Darkstore Assigned'}
                 </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-4">
              {/* Availability Toggle */}
              <div className="flex items-center space-x-2 md:space-x-3 bg-muted/50 px-2 md:px-4 py-1 md:py-2 rounded-xl border border-border/50 backdrop-blur-sm">
                <Power className={`h-3 w-3 md:h-4 md:w-4 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-xs md:text-sm font-medium text-foreground hidden sm:block">
                  {isOnline ? 'Online' : 'Offline'}
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
                className="hidden lg:flex"
              >
                <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Profile
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/order-history')}
                className="hidden md:flex"
              >
                <Timer className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                History
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="lg:hidden"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="hidden lg:flex"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                Today's Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-3xl font-bold text-foreground">{stats?.todayDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-3xl font-bold text-green-600">Rs {(stats?.todayEarnings || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Earned</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2">
                <Power className="h-3 w-3 md:h-4 md:w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${isOnline ? 'bg-green-100 text-green-800 border-green-200' : 'bg-muted text-muted-foreground border-border'} text-xs md:text-sm px-2 md:px-3 py-1 border`}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2">
                <Building className="h-3 w-3 md:h-4 md:w-4" />
                Darkstore
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-xs md:text-sm font-medium text-foreground">
                 {profile?.darkstores ? (Array.isArray(profile.darkstores) ? profile.darkstores[0]?.name : (profile.darkstores as any)?.name) : 'Not Assigned'}
               </div>
              <p className="text-xs text-muted-foreground mt-1">Location</p>
            </CardContent>
          </Card>
        </div>

        {/* KYC and Darkstore Status Warnings */}
        {(!profile?.kyc_verified || !profile?.darkstore_id) && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Account Setup Required</h3>
                  <div className="space-y-1 mt-2">
                    {!profile?.kyc_verified && (
                      <p className="text-yellow-700">• Complete KYC verification in your profile</p>
                    )}
                    {!profile?.darkstore_id && (
                      <p className="text-yellow-700">• Contact admin to get assigned to a darkstore</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate('/delivery-profile')}
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="sm"
                  >
                    Complete Profile Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isOnline ? (
          /* Offline Status */
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Power className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 text-foreground">You are Offline</h3>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-lg">Turn on availability to receive orders</p>
                <Button 
                  onClick={toggleAvailability} 
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg"
                  disabled={!profile?.darkstore_id || !profile?.kyc_verified}
                >
                  <Power className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Go Online
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentOrder ? (
          /* Active Order Management */
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg mb-6">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Active Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-primary/5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg">Order #{currentOrder.order_number}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: {currentOrder.profiles?.full_name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: Rs {Number(currentOrder.total_amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Estimated Payout: Rs {getEstimatedPayout(Number(currentOrder.total_amount))}
                      </p>
                    </div>
                    <Badge className={getStatusBadgeClass(currentOrder.status)}>
                      {currentOrder.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2 text-sm">
                      <Building className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Pickup from:</span>
                        <span className="ml-1">{currentOrder.darkstores?.name} - {currentOrder.darkstores?.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Delivery to:</span>
                        <span className="ml-1">{currentOrder.delivery_address}</span>
                      </div>
                    </div>
                    
                    {currentOrder.profiles?.phone_number && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Customer:</span>
                        <span>{currentOrder.profiles.phone_number}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
                    {currentOrder.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'dispatched')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Picked Up
                      </Button>
                    )}
                    
                    {currentOrder.status === 'dispatched' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'out_for_delivery')}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        En Route to Customer
                      </Button>
                    )}
                    
                    {currentOrder.status === 'out_for_delivery' && (
                      <Button 
                        onClick={() => handleStatusUpdate(currentOrder.id, 'delivered')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Available Orders for Pickup */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Available Orders</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAvailable()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            {!availableOrders?.length ? (
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">No Orders Available</h3>
                    <p className="text-muted-foreground text-sm">
                      All orders from your darkstore have been claimed or none are ready for pickup yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {availableOrders.map((order: OrderWithProfile) => (
                  <Card key={order.id} className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-600">Customer: {order.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Amount: Rs {Number(order.total_amount).toFixed(2)}</p>
                          <p className="text-sm text-green-600 font-medium">
                            Estimated Payout: Rs {getEstimatedPayout(Number(order.total_amount))}
                          </p>
                        </div>
                        <Badge className={getStatusBadgeClass(order.status)}>
                          Ready for Pickup
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start space-x-2 text-sm">
                          <Building className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <span className="font-medium">Pickup from:</span>
                            <span className="ml-1">{order.darkstores?.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <span className="font-medium">Deliver to:</span>
                            <span className="ml-1">{order.delivery_address}</span>
                          </div>
                        </div>
                        
                        {order.profiles?.phone_number && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Customer:</span>
                            <span>{order.profiles.phone_number}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleClaimOrder(order.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={claimOrderMutation.isPending}
                      >
                        {claimOrderMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept & Claim Order
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;