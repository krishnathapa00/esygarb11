import React, { useState, useCallback } from "react";
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
  const [dateFilter, setDateFilter] = useState<
    "today" | "week" | "month" | "year" | "custom"
  >("today");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const getStartEndDates = useCallback(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateFilter === "custom" && customDate) {
      startDate = new Date(customDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          break;
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());
          endDate = new Date();
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date();
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date();
          break;
      }
    }

    return { startDate, endDate };
  }, [dateFilter, customDate]);

  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    const { startDate, endDate } = getStartEndDates();

    let ordersQuery = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate)
      ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
    if (endDate)
      ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());

    const [ordersResult, usersResult, productsResult] = await Promise.all([
      ordersQuery,
      supabase.from("profiles").select("*").eq("role", "customer"),
      supabase.from("products").select("*").lt("stock_quantity", 10),
    ]);

    const orders = ordersResult.data || [];
    const users = usersResult.data || [];
    const products = productsResult.data || [];

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const todayOrders = orders.filter(
      (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
    );

    return {
      totalOrders: orders.length,
      totalRevenue: deliveredOrders.reduce(
        (s, o) => s + Number(o.total_amount || 0),
        0
      ),
      totalUsers: users.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      refundsProcessed: orders.filter((o) => o.payment_status === "refunded")
        .length,
      recentOrders: orders.slice(0, 5),
      lowStockProducts: products.slice(0, 5),
      todayOrdersCount: todayOrders.length,
      todayRevenue: todayOrders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + Number(o.total_amount || 0), 0),
    };
  }, [getStartEndDates]);

  const { data, refetch } = useQuery({
    queryKey: ["admin-dashboard", dateFilter, customDate],
    queryFn: fetchDashboardData,
  });

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refetch();
    toast({ title: "Dashboard updated" });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRefund = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("id", orderId);
    toast({ title: "Refund processed" });
    refetch();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500">Welcome back, Admin</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={dateFilter}
              onValueChange={(v) => setDateFilter(v as any)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Pick Date</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <input
                type="date"
                className="border px-2 py-1 rounded w-full sm:w-auto"
                onChange={(e) =>
                  setCustomDate(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: "Total Orders",
              value: data?.totalOrders,
              icon: ShoppingBag,
            },
            {
              title: "Revenue",
              value: `Rs ${data?.totalRevenue.toLocaleString()}`,
              icon: TrendingUp,
            },
            { title: "Users", value: data?.totalUsers, icon: Users },
            {
              title: "Pending Orders",
              value: data?.pendingOrders,
              icon: Clock,
            },
          ].map(({ title, value, icon: Icon }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-2xl font-bold">{value}</div>
                <Icon className="h-8 w-8 opacity-70" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} • Rs{" "}
                      {Number(order.total_amount).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {order.status}
                    </span>
                    {order.status === "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefund(order.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-gray-100 rounded mr-3 overflow-hidden">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">ID: {product.id}</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-medium">
                    {product.stock_quantity} left
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
