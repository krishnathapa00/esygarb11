
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ShoppingBag, Users, TrendingUp, Package, UserCheck, Clock, RotateCcw, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real dashboard data from Supabase
  const { data: dashboardData, refetch, isLoading } = useQuery({
    queryKey: ['admin-dashboard', dateFilter],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Fetch orders for today specifically
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: todayOrders, error: todayOrdersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', todayStart.toISOString());

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      // Fetch users registered today
      const { data: todayUsers, error: todayUsersError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', todayStart.toISOString());

      // Fetch products for inventory
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', 10);

      if (ordersError || usersError || productsError) {
        console.error('Dashboard fetch error:', ordersError || usersError || productsError);
        return {
          totalOrders: 0,
          ordersToday: 0,
          totalRevenue: 0,
          revenueToday: 0,
          totalUsers: 0,
          newUsersToday: 0,
          pendingOrders: 0,
          lowStockItems: 0,
          refundsProcessed: 0,
          refundAmount: 0,
          recentOrders: [],
          lowStockProducts: []
        };
      }

      const totalOrders = orders?.length || 0;
      const ordersToday = todayOrders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const revenueToday = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalUsers = users?.length || 0;
      const newUsersToday = todayUsers?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending')?.length || 0;
      const lowStockItems = products?.length || 0;
      const refundsProcessed = orders?.filter(order => order.payment_status === 'refunded')?.length || 0;
      const refundAmount = orders?.filter(order => order.payment_status === 'refunded')
        ?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return {
        totalOrders,
        ordersToday,
        totalRevenue,
        revenueToday,
        totalUsers,
        newUsersToday,
        pendingOrders,
        lowStockItems,
        refundsProcessed,
        refundAmount,
        recentOrders: orders?.slice(0, 5) || [],
        lowStockProducts: products?.slice(0, 5) || []
      };
    }
  });

  const handleRefund = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'refunded' })
      .eq('id', orderId);
    
    if (error) {
      toast({
        title: "Refund failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Refund processed",
        description: `Order ${orderId} has been refunded.`
      });
      refetch();
    }
  };

  const handleRefresh = () => {
    refetch();
    // Force reload all queries
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    queryClient.refetchQueries({ queryKey: ['admin-dashboard'] });
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated."
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-gray-500">Welcome back, Admin</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
                  <p className="text-xs text-green-600">+{dashboardData?.ordersToday || 0} today</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">Rs {(dashboardData?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-green-600">+Rs {(dashboardData?.revenueToday || 0).toLocaleString()} today</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
                  <p className="text-xs text-green-600">+{dashboardData?.newUsersToday || 0} today</p>
                </div>
                <Users className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData?.pendingOrders || 0}</div>
                  <p className="text-xs text-amber-600">Needs attention</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refund Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Refunds Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData?.refundsProcessed || 0}</div>
                  <p className="text-xs text-blue-600">Rs {(dashboardData?.refundAmount || 0).toLocaleString()} total</p>
                </div>
                <RotateCcw className="h-8 w-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentOrders?.length > 0 ? dashboardData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} • Rs {Number(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                      {order.status === 'delivered' && order.payment_status !== 'refunded' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRefund(order.id)}
                          className="text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No recent orders found</p>
                )}
              </div>
              
              <div className="mt-4">
                <Link to="/admin/orders">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View all orders
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Inventory Alerts */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.lowStockProducts?.length > 0 ? dashboardData.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-md mr-3 overflow-hidden">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-medium">
                      {product.stock_quantity || 0} left
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No low stock items</p>
                )}
              </div>
              
              <div className="mt-4">
                <Link to="/admin/products">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Manage inventory
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
