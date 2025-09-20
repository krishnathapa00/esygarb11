import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  RotateCcw,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "./components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  refundsProcessed: number;
  recentOrders: any[];
  lowStockProducts: any[];
  todayOrdersCount: number;
  todayRevenue: number;
}

const AdminDashboard = () => {
  const [dateFilter, setDateFilter] = useState("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    try {
      const now = new Date();
      let startDate;
      let endDate;

      switch (dateFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(now);
          break;
        case "week":
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          endDate = new Date(now);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now);
          break;
        default:
          startDate = null;
          endDate = null;
      }

      const ordersQuery = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (startDate) {
        ordersQuery.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        ordersQuery.lte("created_at", endDate.toISOString());
      }

      const [ordersResult, usersResult, productsResult] = await Promise.all([
        ordersQuery,
        supabase.from("profiles").select("*").eq("role", "customer"),
        supabase.from("products").select("*").lt("stock_quantity", 10),
      ]);

      const orders = ordersResult.data || [];
      const users = usersResult.data || [];
      const products = productsResult.data || [];

      const totalOrders = orders.length;

      const deliveredOrders = orders.filter(
        (order) => order.status === "delivered"
      );

      const totalRevenue = deliveredOrders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      const todayOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      });

      const todayOrdersCount = todayOrders.length;

      const todayRevenue = todayOrders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

      const totalUsers = users.length;
      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      ).length;
      const refundsProcessed = orders.filter(
        (order) => order.payment_status === "refunded"
      ).length;

      return {
        totalOrders,
        totalRevenue,
        totalUsers,
        pendingOrders,
        refundsProcessed,
        recentOrders: orders.slice(0, 5),
        lowStockProducts: products.slice(0, 5),
        todayOrdersCount,
        todayRevenue,
      };
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        pendingOrders: 0,
        refundsProcessed: 0,
        recentOrders: [],
        lowStockProducts: [],
        todayOrdersCount: 0,
        todayRevenue: 0,
      };
    }
  }, [dateFilter]);

  // Query with real-time updates
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ["admin-dashboard-simple"],
    queryFn: fetchDashboardData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5 * 1000,
  });

  const handleRefund = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "refunded" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Refund processed",
        description: `Order ${orderId} has been refunded.`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Refund failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data.",
        variant: "destructive",
      });
    }
    // Use timeout to prevent state update loops
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refetch, toast, isRefreshing]);

  // Safe data access with defaults
  const data = dashboardData || {
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    refundsProcessed: 0,
    recentOrders: [],
    lowStockProducts: [],
    todayOrdersCount: 0,
    todayRevenue: 0,
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
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{data.totalOrders}</div>
                  <p className="text-xs text-green-600">
                    +{data.todayOrdersCount} today
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">
                    Rs {data.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">
                    +Rs {data.todayRevenue.toLocaleString()} today
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{data.totalUsers}</div>
                  <p className="text-xs text-green-600">+0 today</p>
                </div>
                <Users className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{data.pendingOrders}</div>
                  <p className="text-xs text-amber-600">Needs attention</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600 opacity-80" />
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
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} • Rs{" "}
                          {Number(order.total_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                        {order.status === "delivered" &&
                          order.payment_status !== "refunded" && (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent orders found
                  </p>
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
                {data.lowStockProducts.length > 0 ? (
                  data.lowStockProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-md mr-3 overflow-hidden">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                      <span className="text-red-600 font-medium">
                        {product.stock_quantity || 0} left
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No low stock items
                  </p>
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
