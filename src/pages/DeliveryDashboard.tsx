
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Package, CheckCircle, User, DollarSign, RefreshCw, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: availableOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey ( full_name, phone_number ),
          darkstores ( name, city )
        `)
        .eq('status', 'ready_for_pickup')
        .eq('darkstore_id', profile?.darkstore_id ? parseInt(profile.darkstore_id) : 0)
        .is('delivery_partner_id', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.darkstore_id
  });

  const { data: myOrders = [], refetch: refetchMyOrders } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey ( full_name, phone_number ),
          darkstores ( name, city )
        `)
        .eq('delivery_partner_id', user?.id)
        .in('status', ['dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: todayEarnings } = useQuery({
    queryKey: ['today-earnings', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select('amount')
        .eq('delivery_partner_id', user?.id)
        .gte('created_at', today)
        .lt('created_at', `${today}T23:59:59.999Z`);
      
      if (error) throw error;
      return data.reduce((sum, earning) => sum + parseFloat(earning.amount.toString()), 0);
    },
    enabled: !!user?.id
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: user?.id,
          status: 'dispatched',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders', user?.id] });
      toast({
        title: "Order Accepted",
        description: "Order has been assigned to you.",
      });
    }
  });

  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (online: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: online })
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: (_, online) => {
      setIsOnline(online);
      toast({
        title: online ? "You're Online" : "You're Offline",
        description: online ? "You can now receive orders" : "You won't receive new orders",
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setIsOnline(profile.is_online || false);
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/delivery/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Badge variant="outline" className="text-indigo-600">Dispatched</Badge>;
      case 'out_for_delivery':
        return <Badge variant="outline" className="text-orange-600">Out for Delivery</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Delivery Partner'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Button
                variant={isOnline ? "default" : "outline"}
                size="sm"
                onClick={() => updateOnlineStatusMutation.mutate(!isOnline)}
                disabled={updateOnlineStatusMutation.isPending}
              >
                {isOnline ? "Online" : "Offline"}
              </Button>
            </div>
            <Button variant="outline" asChild>
              <Link to="/delivery/profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Available Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableOrders.length}</div>
              <p className="text-sm text-muted-foreground">Ready for pickup</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders.length}</div>
              <p className="text-sm text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{todayEarnings?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Current session</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Orders</span>
                <Button size="sm" variant="outline" onClick={() => refetchOrders()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders available at the moment
                  </p>
                ) : (
                  availableOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.profiles?.full_name} - {order.profiles?.phone_number}
                          </p>
                        </div>
                        <Badge variant="outline">₹{parseFloat(order.total_amount.toString()).toFixed(2)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{order.delivery_address}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => acceptOrderMutation.mutate(order.id)}
                        disabled={acceptOrderMutation.isPending}
                        className="w-full"
                      >
                        Accept Order
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Active Orders</span>
                <Button size="sm" variant="outline" onClick={() => refetchMyOrders()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active orders
                  </p>
                ) : (
                  myOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.profiles?.full_name} - {order.profiles?.phone_number}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(order.status)}
                          <Badge variant="outline">₹{parseFloat(order.total_amount.toString()).toFixed(2)}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{order.delivery_address}</span>
                      </div>
                      <Button
                        size="sm"
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link to={`/delivery/orders/${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
