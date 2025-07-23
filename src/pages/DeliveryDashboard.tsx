
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, MapPin, Phone, CheckCircle, AlertCircle, Package, DollarSign, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const { user } = useAuth();
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

  const { data: availableOrders = [] } = useQuery({
    queryKey: ['available-orders', profile?.darkstore_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('status', 'ready_for_pickup')
        .eq('darkstore_id', profile?.darkstore_id)
        .is('delivery_partner_id', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.darkstore_id && profile?.kyc_verified && isOnline,
    refetchInterval: 5000
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('delivery_partner_id', user?.id)
        .in('status', ['ready_for_pickup', 'dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 10000
  });

  const { data: todayEarnings } = useQuery({
    queryKey: ['today-earnings', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select('amount')
        .eq('delivery_partner_id', user?.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      
      if (error) throw error;
      return data.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
    },
    enabled: !!user?.id
  });

  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (isOnline) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: isOnline })
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile', user?.id] });
    }
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId) => {
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
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast({
        title: "Order Accepted",
        description: "You have successfully accepted this order.",
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setIsOnline(profile.is_online || false);
    }
  }, [profile]);

  const handleOnlineToggle = (checked) => {
    setIsOnline(checked);
    updateOnlineStatusMutation.mutate(checked);
  };

  const handleOrderNavigation = (order) => {
    navigate(`/delivery/order/${order.id}`);
  };

  const isSetupComplete = profile?.kyc_verified && profile?.darkstore_id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Online Status:</span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleOnlineToggle}
                disabled={!isSetupComplete}
              />
              <Badge variant={isOnline ? "default" : "outline"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <Button onClick={() => navigate('/delivery/profile')} variant="outline">
              Profile
            </Button>
          </div>
        </div>

        {!isSetupComplete && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Account setup required</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please complete your profile and KYC verification to start receiving orders.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">₹{todayEarnings?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{myOrders.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Available Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{availableOrders.length}</p>
            </CardContent>
          </Card>
        </div>

        {isSetupComplete && isOnline && (
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableOrders.length > 0 ? (
                  availableOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge variant="outline">₹{parseFloat(order.total_amount).toFixed(2)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Customer: {order.profiles?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Phone: {order.profiles?.phone_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {order.delivery_address}
                          </p>
                        </div>
                        <Button
                          onClick={() => acceptOrderMutation.mutate(order.id)}
                          disabled={acceptOrderMutation.isPending}
                        >
                          Accept Order
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No orders available at the moment. Stay online to receive new orders.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>My Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.length > 0 ? (
                myOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">Order #{order.order_number}</h3>
                          <Badge variant="outline">{order.status.replace('_', ' ')}</Badge>
                          <Badge variant="outline">₹{parseFloat(order.total_amount).toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Customer: {order.profiles?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {order.delivery_address}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleOrderNavigation(order)}
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active orders. Accept an order to get started.
                </p>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
