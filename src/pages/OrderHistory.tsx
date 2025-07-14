import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, MapPin, Clock, DollarSign, TrendingUp } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  estimated_delivery: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}

interface EarningsStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  totalDeliveries: number;
  avgOrderValue: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<EarningsStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    totalDeliveries: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderHistory();
    calculateEarnings();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/delivery-auth');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, phone_number)
        `)
        .eq('delivery_partner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: deliveredOrders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('delivery_partner_id', user.id)
        .eq('status', 'delivered');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const deliveryFeePercentage = 0.15; // 15% of order value as delivery fee

      let todayEarnings = 0;
      let weeklyEarnings = 0;
      let monthlyEarnings = 0;
      let totalEarnings = 0;

      deliveredOrders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const earnings = Number(order.total_amount) * deliveryFeePercentage;
        
        totalEarnings += earnings;
        
        if (orderDate >= today) {
          todayEarnings += earnings;
        }
        if (orderDate >= weekAgo) {
          weeklyEarnings += earnings;
        }
        if (orderDate >= monthAgo) {
          monthlyEarnings += earnings;
        }
      });

      const totalOrderValue = deliveredOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const avgOrderValue = deliveredOrders?.length ? totalOrderValue / deliveredOrders.length : 0;

      setEarnings({
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        totalEarnings,
        totalDeliveries: deliveredOrders?.length || 0,
        avgOrderValue
      });
    } catch (error) {
      console.error('Error calculating earnings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'confirmed': return 'bg-blue-500';
      case 'dispatched': return 'bg-yellow-500';
      case 'out_for_delivery': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/delivery-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order History & Earnings</h1>
            <p className="text-muted-foreground">Track your deliveries and earnings</p>
          </div>
        </div>

        {/* Earnings Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {earnings.todayEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {earnings.weeklyEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {earnings.monthlyEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">Rs {earnings.totalEarnings.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{earnings.totalDeliveries}</div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">Rs {earnings.avgOrderValue.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order History
            </CardTitle>
            <CardDescription>
              View your past deliveries and track performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="pending">In Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{order.delivery_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>Rs {Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          {order.profiles && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Customer:</span>
                              <span>{order.profiles.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{order.estimated_delivery}</span>
                          </div>
                        </div>
                        
                        {order.status === 'delivered' && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Your Earnings:</span>
                               <span className="font-medium text-success">
                                Rs {(Number(order.total_amount) * 0.15).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="delivered" className="space-y-4">
                {getOrdersByStatus('delivered').map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className="bg-green-500 text-white">DELIVERED</Badge>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><MapPin className="w-4 h-4 inline mr-2" />{order.delivery_address}</p>
                      <p><DollarSign className="w-4 h-4 inline mr-2" />Rs {Number(order.total_amount).toFixed(2)}</p>
                      <p className="font-medium text-success">
                        Earned: Rs {(Number(order.total_amount) * 0.15).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="cancelled" className="space-y-4">
                {getOrdersByStatus('cancelled').map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className="bg-red-500 text-white">CANCELLED</Badge>
                    </div>
                    <div className="text-sm">
                      <p><MapPin className="w-4 h-4 inline mr-2" />{order.delivery_address}</p>
                      <p><DollarSign className="w-4 h-4 inline mr-2" />Rs {Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4">
                {orders.filter(order => ['confirmed', 'dispatched', 'out_for_delivery'].includes(order.status)).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p><MapPin className="w-4 h-4 inline mr-2" />{order.delivery_address}</p>
                      <p><DollarSign className="w-4 h-4 inline mr-2" />Rs {Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}