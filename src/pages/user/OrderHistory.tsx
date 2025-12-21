import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/shared";
import { useCancelOrder } from "@/services/orderCancel";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  totalItems: number;
  totalAmount: number;
  deliveryAddress: string;
  estimatedDelivery: string;
  paymentMethod: string;
  status: string;
  userId: string;
  createdAt: string;
  deliveredAt?: string;
}

const OrderHistory = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchUserOrders();
    }
  }, [user, loading, navigate]);

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `
        )
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match existing interface
      const transformedOrders = data.map((order) => ({
        orderId: order.order_number,
        items: order.order_items.map((item) => ({
          id: String(item.id),
          name: item.products?.name || "Unknown Product",
          price: parseFloat(String(item.price)),
          quantity: item.quantity,
          image: item.products?.image_url || "/placeholder.svg",
        })),
        totalItems: order.order_items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        totalAmount: parseFloat(String(order.total_amount)),
        deliveryAddress: order.delivery_address,
        estimatedDelivery: order.estimated_delivery,
        paymentMethod: "Cash on Delivery",
        status: order.status,
        userId: order.user_id,
        createdAt: order.created_at,
        deliveredAt: order.delivered_at,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "out for delivery":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "preparing":
        return <Clock className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        // Soft Delete from User POV
        const { error } = await supabase
          .from("orders")
          .update({ is_deleted: true })
          .eq("order_number", orderId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        const updatedOrders = orders.filter(
          (order) => order.orderId !== orderId
        );
        setOrders(updatedOrders);
        setSelectedOrder(null);
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  const calculateDeliveryTime = (order: any) => {
    if (!order.deliveredAt) return "Not delivered yet";

    const createdAt = new Date(order.createdAt);
    const deliveredAt = new Date(order.deliveredAt);
    const diffMs = deliveredAt.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} mins`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="px-4 py-4 max-w-md mx-auto lg:max-w-4xl lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="mr-3 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteOrder(selectedOrder.orderId)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>

          <div className="space-y-4">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      #{selectedOrder.orderId}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Delivery Address:</span>
                    <span className="text-right">
                      {selectedOrder.deliveryAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Delivery:</span>
                    <span>{selectedOrder.estimatedDelivery}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 py-2 border-b last:border-b-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rs {item.price * item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rs {item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>Rs {selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-4 max-w-md mx-auto lg:max-w-4xl lg:px-8">
        <div className="flex items-center mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Order History
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Your order history will appear here once you place an order.
            </p>
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.orderId}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    {/* Left side: Order info */}
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-900">
                        #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                      {order.status === "delivered" && (
                        <p className="text-xs text-green-600 font-medium">
                          Delivered in {calculateDeliveryTime(order)}
                        </p>
                      )}
                    </div>

                    {/* Right side: Cancel Button + Status Badge */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                      <CancelOrderButton
                        order={order}
                        userId={user.id}
                        onCancelled={fetchUserOrders}
                      />
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.totalItems}{" "}
                        {order.totalItems === 1 ? "item" : "items"}
                      </p>
                      <p className="font-semibold text-lg">
                        Rs {order.totalAmount}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/order-tracking/${order.orderId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                        >
                          Track Order
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Delivery: {order.deliveryAddress}</p>
                    <p>Payment: {order.paymentMethod}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

const CancelOrderButton = ({
  order,
  userId,
  onCancelled,
}: {
  order: Order;
  userId: string;
  onCancelled: () => void;
}) => {
  const { canCancel, remainingSeconds, cancelOrder, loading } = useCancelOrder(
    order.orderId,
    userId,
    order.createdAt,
    order.status,
    onCancelled
  );

  if (!canCancel) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="flex flex-col items-end sm:items-start gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={cancelOrder}
        className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto"
      >
        {loading ? "Cancelling..." : "Cancel Order"}
      </Button>

      <span className="text-xs text-gray-500">
        Cancel in {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};
