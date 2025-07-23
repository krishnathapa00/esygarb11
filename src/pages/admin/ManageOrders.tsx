
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, RefreshCw, Package, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';

const ManageOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey ( full_name, phone_number ),
          order_items ( *, products:product_id ( name, price, image_url ) ),
          delivery_partner:profiles!orders_delivery_partner_id_fkey ( full_name, phone_number ),
          darkstores ( name, city )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: "pending" | "confirmed" | "dispatched" | "out_for_delivery" | "delivered" | "cancelled" | "ready_for_pickup" }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.phone_number?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600">Confirmed</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="outline" className="text-purple-600">Ready for Pickup</Badge>;
      case 'dispatched':
        return <Badge variant="outline" className="text-indigo-600">Dispatched</Badge>;
      case 'out_for_delivery':
        return <Badge variant="outline" className="text-orange-600">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-green-600">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: "pending" | "confirmed" | "dispatched" | "out_for_delivery" | "delivered" | "cancelled" | "ready_for_pickup") => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders by number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="dispatched">Dispatched</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div>Loading orders...</div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">Order #{order.order_number}</h3>
                      {getStatusBadge(order.status)}
                      <Badge variant="outline">₹{parseFloat(order.total_amount.toString()).toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Customer: {order.profiles?.full_name} ({order.profiles?.phone_number})
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Items: {order.order_items?.length || 0} items
                    </p>
                    {order.delivery_partner && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Delivery Partner: {order.delivery_partner.full_name} ({order.delivery_partner.phone_number})
                      </p>
                    )}
                    {order.darkstores && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Darkstore: {order.darkstores.name}, {order.darkstores.city}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Order Date: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Ready
                      </Button>
                    )}
                    
                    {!['delivered', 'cancelled'].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageOrders;
