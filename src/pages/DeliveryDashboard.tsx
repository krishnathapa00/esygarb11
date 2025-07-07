
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, MapPin, Phone, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DeliveryDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user ID
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  // Fetch delivery stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-stats'],
    queryFn: async () => {
      const userId = await getCurrentUser();
      if (!userId) return { todayDeliveries: 0, totalEarnings: 0, pendingOrders: 0, completedOrders: 0 };
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's deliveries
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, total_amount')
        .eq('delivery_partner_id', userId)
        .eq('status', 'delivered')
        .gte('created_at', today);
      
      // Get all completed orders
      const { data: allCompleted } = await supabase
        .from('orders')
        .select('id, total_amount')
        .eq('delivery_partner_id', userId)
        .eq('status', 'delivered');
        
      // Get pending orders
      const { data: pending } = await supabase
        .from('orders')
        .select('id')
        .eq('delivery_partner_id', userId)
        .in('status', ['dispatched', 'out_for_delivery']);
      
      return {
        todayDeliveries: todayOrders?.length || 0,
        totalEarnings: allCompleted?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        pendingOrders: pending?.length || 0,
        completedOrders: allCompleted?.length || 0
      };
    }
  });

  // Fetch active orders assigned to this delivery partner
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['delivery-active-orders'],
    queryFn: async () => {
      const userId = await getCurrentUser();
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, total_amount, delivery_address, estimated_delivery,
          profiles!orders_user_id_fkey (full_name, phone_number),
          order_items (quantity)
        `)
        .eq('delivery_partner_id', userId)
        .in('status', ['dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(order => ({
        id: order.order_number,
        customerName: order.profiles?.full_name || 'Unknown Customer',
        address: order.delivery_address,
        phone: order.profiles?.phone_number || 'N/A',
        items: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        amount: Number(order.total_amount),
        estimatedTime: order.estimated_delivery || '10-15 mins',
        orderId: order.id
      })) || [];
    }
  });

  const handleMarkDelivered = async (orderId: string) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', order.orderId);
    
    if (error) {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Order marked as delivered",
        description: `Order ${orderId} has been successfully delivered`,
      });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-active-orders'] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Delivery Partner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/delivery-profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {stats?.totalEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for pickup</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedOrders || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">Rs {order.amount}</p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>ETA: {order.estimatedTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkDelivered(order.id)}
                    >
                      Mark Delivered
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact Customer
                    </Button>
                  </div>
                </div>
              ))}
              
              {activeOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active deliveries at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
