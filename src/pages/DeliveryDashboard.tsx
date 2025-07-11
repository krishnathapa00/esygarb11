import React from "react";
import { Link } from "react-router-dom";
import { Package, Clock, MapPin, Phone, DollarSign, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const DeliveryDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch delivery partner's stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', user.id);

      if (error) {
        toast({
          title: "Failed to load stats",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      const today = new Date().toDateString();
      const todayOrders = orders?.filter(order => 
        new Date(order.created_at).toDateString() === today
      ) || [];

      return {
        todayDeliveries: todayOrders.filter(o => o.status === 'delivered').length,
        totalEarnings: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        pendingOrders: orders?.filter(o => o.status === 'dispatched' || o.status === 'out_for_delivery').length || 0,
        completedOrders: orders?.filter(o => o.status === 'delivered').length || 0,
      };
    },
    enabled: !!user?.id
  });

  // Fetch assigned orders
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['delivery-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey ( full_name, phone_number ),
          order_items ( quantity )
        `)
        .eq('delivery_partner_id', user.id)
        .in('status', ['dispatched', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Failed to load orders",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleMarkDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Order marked as delivered",
        description: "Order status has been updated successfully."
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
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
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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
              <CardTitle className="text-sm font-medium">
                Today's Deliveries
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {stats?.totalEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">
                +15% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for pickup</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Completed
              </CardTitle>
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
                      <h3 className="font-semibold">Order #{order.order_number}</h3>
                      <p className="text-sm text-gray-600">
                        {order.profiles?.full_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        Rs {order.total_amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.order_items?.length || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{order.delivery_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{order.profiles?.phone_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>ETA: {order.estimated_delivery}</span>
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
