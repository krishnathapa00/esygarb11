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
import PaginationControls from "@/components/PaginationControls";

const ManageOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState("");
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fixed query functions to prevent re-renders
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders-stable"],
    queryFn: async () => {
      const { data, error } = await supabase
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
    retry: false,
  });

  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          // Refetch orders when a new order is inserted
          refetchOrders();

          showToast(`New order placed: #${payload.new.order_number}`, "info");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          refetchOrders();
          if (payload.new.status === "cancelled") {
            showToast(
              `Order #${payload.new.order_number} was cancelled.`,
              "info"
            );
          } else {
            showToast(`Order #${payload.new.order_number} updated.`, "info");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchOrders]);

  const { data: deliveryPartners = [] } = useQuery({
    queryKey: ["delivery-partners-stable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number")
        .eq("role", "delivery_partner");

      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: isSuperAdmin = false } = useQuery({
    queryKey: ["super-admin-stable"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_super_admin");
      return data || false;
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Memoized functions to prevent re-renders
  const getStatusColor = useMemo(
    () => (status: string) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "confirmed":
          return "bg-blue-100 text-blue-800";
        case "ready_for_pickup":
          return "bg-cyan-100 text-cyan-800";
        case "dispatched":
          return "bg-indigo-100 text-indigo-800";
        case "out_for_delivery":
          return "bg-purple-100 text-purple-800";
        case "delivered":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    []
  );

  // Memoized filtered orders to prevent recalculation on every render
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

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Event handlers
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (!error) {
        toast({
          title: "Order updated",
          description: "Status updated successfully.",
        });
        refetchOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      });
    }
  };

  const handleAssignDeliveryPartner = async () => {
    if (!selectedOrder || !selectedDeliveryPartner) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          delivery_partner_id: selectedDeliveryPartner,
          status: "dispatched",
        })
        .eq("id", selectedOrder.id);

      if (!error) {
        toast({ title: "Success", description: "Delivery partner assigned." });
        setAssignModalOpen(false);
        setSelectedOrder(null);
        setSelectedDeliveryPartner("");
        refetchOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign partner.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout onRefresh={() => refetchOrders()}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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

        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.order_items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.profiles?.full_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rs {order.total_amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={getStatusColor(order.status || "pending")}
                      >
                        {order.status?.replace("_", " ") || "pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-1 justify-end">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          state={{ order }}
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>

                        {(order.status === "confirmed" ||
                          order.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Assign Modal */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
              <DialogDescription>
                Select a delivery partner for order{" "}
                {selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            <Select
              value={selectedDeliveryPartner}
              onValueChange={setSelectedDeliveryPartner}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery partner" />
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

