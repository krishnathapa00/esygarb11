
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  User, 
  Phone,
  MapPin,
  Navigation
} from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
    fetchEarnings();
    fetchOnlineStatus();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (full_name, phone_number),
          order_items (quantity, price, products (name))
        `)
        .eq('delivery_partner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select('*')
        .eq('delivery_partner_id', user?.id)
        .order('created_at', { ascending: false });

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
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setIsOnline(data?.is_online || false);
    } catch (error) {
      console.error('Error fetching online status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: !isOnline })
        .eq('id', user?.id);

      if (error) throw error;
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
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
      
      fetchOrders();
      fetchEarnings();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready_for_pickup': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
  const todayEarnings = earnings
    .filter(earning => new Date(earning.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, earning) => sum + parseFloat(earning.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleOnlineStatus}
              className={`${
                isOnline 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/delivery/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(order => 
                  new Date(order.created_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(order => order.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {todayEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.filter(order => ['ready_for_pickup', 'accepted', 'picked_up', 'out_for_delivery'].includes(order.status)).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                      <p className="text-gray-600">
                        <User className="inline w-4 h-4 mr-1" />
                        {order.profiles?.full_name || 'Unknown Customer'}
                      </p>
                      <p className="text-gray-600">
                        <Phone className="inline w-4 h-4 mr-1" />
                        {order.profiles?.phone_number || 'No phone'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold mt-2">Rs {order.total_amount}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Delivery Address:
                    </p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.order_items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.products?.name} x{item.quantity}</span>
                          <span>Rs {item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'ready_for_pickup' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Accept Order
                      </Button>
                    )}
                    {order.status === 'accepted' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'picked_up')}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Mark as Picked Up
                      </Button>
                    )}
                    {order.status === 'picked_up' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        Out for Delivery
                      </Button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/delivery/order/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {orders.filter(order => ['ready_for_pickup', 'accepted', 'picked_up', 'out_for_delivery'].includes(order.status)).length === 0 && (
                <p className="text-center text-gray-500 py-8">No orders available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.filter(order => order.status === 'delivered').slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.delivered_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rs {order.total_amount}</p>
                    <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                  </div>
                </div>
              ))}
              {orders.filter(order => order.status === 'delivered').length === 0 && (
                <p className="text-center text-gray-500 py-4">No deliveries yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
