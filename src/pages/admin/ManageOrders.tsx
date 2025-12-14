import { useState, useMemo, useEffect } from "react";
import { Search, Eye, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "./components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { showToast } from "@/components/Toast";

const ManageOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  /* ===================== FETCH ORDERS ===================== */
  const { data: fetchedOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders-stable"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(
          `
          *,
          profiles!orders_user_id_fkey ( full_name ),
          order_items ( quantity )
        `
        )
        .order("created_at", { ascending: false });

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setOrders(fetchedOrders);
  }, [fetchedOrders]);

  /* ===================== REALTIME ===================== */
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          showToast(`New order placed: #${payload.new.order_number}`, "info");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? payload.new : o))
          );
          showToast(`Order #${payload.new.order_number} updated`, "info");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ===================== DELIVERY PARTNERS ===================== */
  const { data: deliveryPartners = [] } = useQuery({
    queryKey: ["delivery-partners-stable"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "delivery_partner");
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  /* ===================== FILTERING ===================== */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  /* ===================== HELPERS ===================== */
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      ready_for_pickup: "bg-cyan-100 text-cyan-800",
      dispatched: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  /* ===================== ASSIGN PARTNER ===================== */
  const handleAssignDeliveryPartner = async () => {
    if (!selectedOrder || !selectedDeliveryPartner) return;

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_partner_id: selectedDeliveryPartner,
        status: "dispatched",
      })
      .eq("id", selectedOrder.id);

    if (!error) {
      toast({
        title: "Success",
        description: "Delivery partner assigned",
      });
      setAssignModalOpen(false);
      setSelectedOrder(null);
      setSelectedDeliveryPartner("");
      refetchOrders();
    } else {
      toast({
        title: "Error",
        description: "Failed to assign partner",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ===================== HEADER ===================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Orders Management</h1>

          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="ready_for_pickup">
                  Ready for Pickup
                </SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="out_for_delivery">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ===================== MOBILE CARDS ===================== */}
        <div className="space-y-4 md:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 bg-white space-y-3"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {order.order_items?.length || 0} items
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <p>Customer: {order.profiles?.full_name || "N/A"}</p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                <p className="font-semibold">Rs {order.total_amount}</p>
              </div>

              <div className="flex gap-2">
                <Link to={`/admin/orders/${order.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>

                {(order.status === "pending" ||
                  order.status === "confirmed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600"
                    onClick={() => {
                      setSelectedOrder(order);
                      setAssignModalOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ===================== DESKTOP TABLE ===================== */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Date",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4">{order.order_number}</td>
                  <td className="px-6 py-4">
                    {order.profiles?.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">Rs {order.total_amount}</td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {(order.status === "pending" ||
                      order.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => {
                          setSelectedOrder(order);
                          setAssignModalOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================== ASSIGN MODAL ===================== */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
              <DialogDescription>
                Assign partner for order {selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>

            <Select
              value={selectedDeliveryPartner}
              onValueChange={setSelectedDeliveryPartner}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPartners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignDeliveryPartner}
                disabled={!selectedDeliveryPartner}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManageOrders;
