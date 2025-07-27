import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Package, Clock, DollarSign, User, MapPin, Phone, AlertTriangle } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchKycStatus();
      fetchOrders();
      fetchEarnings();
      fetchOnlineStatus();
    }
  }, [user]);

  const fetchKycStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('verification_status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching KYC status:', error);
        return;
      }
      
      setKycStatus(data?.verification_status || 'not_submitted');
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number),
          order_items(
            *,
            products(name, image_url)
          )
        `)
        .or(`delivery_partner_id.eq.${user.id},status.eq.ready_for_pickup`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      });
    }
  };

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select('*')
        .eq('delivery_partner_id', user.id);

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_online')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsOnline(data?.is_online || false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching online status:', error);
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: newStatus })
        .eq('id', user.id);

      if (error) throw error;
      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus 
          ? "You'll receive new delivery requests" 
          : "You won't receive new delivery requests",
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (newStatus === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`,
      });

      fetchOrders();
      fetchEarnings();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.created_at).toDateString() === today;
  });

  const todayEarnings = earnings.filter(earning => {
    const today = new Date().toDateString();
    return new Date(earning.created_at).toDateString() === today;
  }).reduce((sum, earning) => sum + parseFloat(earning.amount || '0'), 0);

  const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount || '0'), 0);

  const availableOrders = orders.filter(order => 
    order.status === 'ready_for_pickup' || 
    (order.delivery_partner_id === user.id && order.status !== 'delivered')
  );

  const recentDeliveries = orders.filter(order => 
    order.delivery_partner_id === user.id && order.status === 'delivered'
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <Button variant="outline" onClick={() => navigate('/delivery-partner/orders')}>
              Orders
            </Button>
            <Button variant="outline" onClick={() => navigate('/delivery-partner/earnings')}>
              Earnings
            </Button>
            <Button variant="outline" onClick={() => navigate('/delivery-partner/history')}>
              History
            </Button>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="online-status"
                checked={isOnline}
                onCheckedChange={toggleOnlineStatus}
              />
              <Label htmlFor="online-status">
                {isOnline ? 'Online' : 'Offline'}
              </Label>
            </div>
            <Button onClick={() => navigate('/delivery-partner/profile')}>
              Profile
            </Button>
          </div>
        </div>

        {/* KYC Notice */}
        {(kycStatus !== 'approved') && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Account Setup & KYC Verification Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Complete your profile and upload required documents to start accepting orders.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/delivery-partner/profile')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold">{todayOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                  <p className="text-2xl font-bold">{earnings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl font-bold">₹{todayEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Orders - Only show when online and KYC approved */}
        {isOnline && kycStatus === 'approved' && (
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {availableOrders.length > 0 ? (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{order.profiles?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{order.profiles?.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{order.delivery_address}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Order Items:</p>
                      {order.order_items?.map((item: any, index: number) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.products?.name}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      <div className="space-x-2">
                        {order.status === 'ready_for_pickup' && !order.delivery_partner_id && (
                          <Button 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'dispatched')}
                          >
                            Accept Order
                          </Button>
                        )}
                        {order.delivery_partner_id === user.id && order.status === 'accepted' && (
                          <Button 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {order.delivery_partner_id === user.id && order.status === 'out_for_delivery' && (
                          <Button 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/delivery-partner/order/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No available orders at the moment.
              </p>
            )}
          </CardContent>
        </Card>
        )}

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length > 0 ? (
              <div className="space-y-3">
                {recentDeliveries.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{order.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent deliveries.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;