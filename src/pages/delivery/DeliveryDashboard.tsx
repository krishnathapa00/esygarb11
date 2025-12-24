import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRefreshOnWindowFocus } from "@/hooks/useRefreshOnWindowFocus";
import {
  Package,
  Clock,
  DollarSign,
  User,
  MapPin,
  Phone,
  AlertTriangle,
} from "lucide-react";

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deliveryPartnerName, setDeliveryPartnerName] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [kycStatus, setKycStatus] = useState("pending");
  const audio = useRef(null);

  useEffect(() => {
    audio.current = new Audio("/sounds/notification.wav");
  }, []);

  const playNotificationSound = () => {
    if (audio.current) {
      audio.current.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
  };

  // Refresh data when window regains focus
  useRefreshOnWindowFocus(["orders", "earnings", "kyc-status"]);

  // Fetch orders with React Query
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: fetchOrders,
  } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          profiles!orders_user_id_fkey(full_name, phone_number, phone),
          order_items(
            *,
            products(name, image_url)
          )
        `
        )
        .or(
          `delivery_partner_id.eq.${user?.id},status.in.(ready_for_pickup,confirmed,dispatched)`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch earnings with React Query
  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_earnings")
        .select("*")
        .eq("delivery_partner_id", user?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const updateData = {
        status: "dispatched" as const,
        delivery_partner_id: user?.id,
        accepted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast({
        title: "Order Accepted",
        description:
          "Order has been assigned to you. Navigate to start delivery.",
      });
    },
    onError: (error) => {
      console.error("Error accepting order:", error);
      toast({
        title: "Error",
        description: "Failed to accept order.",
        variant: "destructive",
      });
    },
  });

  // Set up real-time subscription for new orders
  useEffect(() => {
    if (!user?.id || !isOnline || kycStatus !== "approved") return;

    const savedPermission = localStorage.getItem("notificationPermission");

    if (savedPermission !== "granted") {
      toast({
        title:
          "Notifications are not enabled. Please enable notifications for real-time updates.",
        variant: "default",
      });

      return;
    }

    const vibrateDevice = () => {
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    };

    const showPushNotification = (order) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Order Ready for Pickup", {
          body: `Order #${order.id} is ready!`,
          icon: "/logo/Esy.jpg",
          tag: `order-${order.id}`,
        });

        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    };

    const channel = supabase
      .channel("order-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;

          if (
            oldStatus !== "ready_for_pickup" &&
            newStatus === "ready_for_pickup"
          ) {
            fetchOrders();
            playNotificationSound();
            vibrateDevice();
            showPushNotification(payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.new?.status === "ready_for_pickup") {
            fetchOrders();
            playNotificationSound();
            vibrateDevice();
            showPushNotification(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isOnline, kycStatus, fetchOrders]);

  useEffect(() => {
    if (user) {
      fetchKycStatus();
      fetchOnlineStatus();
    }
  }, [user]);

  const fetchKycStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select("verification_status")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching KYC status:", error);
        return;
      }

      setKycStatus(data?.verification_status || "not_submitted");
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_online, full_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setIsOnline(data?.is_online || false);
      setDeliveryPartnerName(data?.full_name || "");
    } catch (error) {
      console.error("Error fetching online status:", error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (kycStatus !== "approved") {
      toast({
        title: "KYC Required",
        description: "Complete your KYC verification to go online",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from("profiles")
        .update({ is_online: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus
          ? "You'll receive new delivery requests"
          : "You won't receive new delivery requests",
      });

      // Refetch orders to update available orders when status changes
      await fetchOrders();
    } catch (error) {
      console.error("Error updating online status:", error);
      toast({
        title: "Error",
        description: "Failed to update online status",
        variant: "destructive",
      });
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    acceptOrderMutation.mutate(orderId);
    // Navigate to delivery map navigation page
    navigate(`/delivery-partner/navigate/${orderId}`);
  };

  const rejectOrder = async (orderId: string) => {
    try {
      // Mark order as available for other delivery partners
      const { error } = await supabase
        .from("orders")
        .update({
          delivery_partner_id: null,
          status: "ready_for_pickup",
        })
        .eq("id", orderId)
        .eq("delivery_partner_id", user?.id);

      if (error) throw error;

      toast({
        title: "Order Rejected",
        description: "Order has been made available for other partners.",
      });

      // Refetch orders to update the list
      await fetchOrders();
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast({
        title: "Error",
        description: "Failed to reject order.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_for_pickup":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-yellow-100 text-yellow-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const todayOrders = orders.filter((order) => {
    const today = new Date().toDateString();
    return new Date(order.created_at).toDateString() === today;
  });

  const todayEarnings = earnings
    .filter((earning) => {
      const today = new Date().toDateString();
      return new Date(earning.created_at).toDateString() === today;
    })
    .reduce(
      (sum, earning) => sum + parseFloat(earning.amount?.toString() || "0"),
      0
    );

  const totalEarnings = earnings.reduce(
    (sum, earning) => sum + parseFloat(earning.amount?.toString() || "0"),
    0
  );

  const availableOrders =
    isOnline && kycStatus === "approved"
      ? orders.filter(
          (order) =>
            (order.status === "ready_for_pickup" ||
              order.status === "confirmed" ||
              order.status === "dispatched") &&
            (!order.delivery_partner_id ||
              order.delivery_partner_id === user?.id)
        )
      : [];

  const myActiveOrders = orders.filter(
    (order) =>
      order.delivery_partner_id === user.id &&
      !["delivered", "cancelled"].includes(order.status)
  );

  const recentDeliveries = orders
    .filter(
      (order) =>
        order.delivery_partner_id === user.id && order.status === "delivered"
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Modern Header with Profile Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                  Delivery Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back{" "}
                  <span className="font-medium">{deliveryPartnerName}</span>,
                  manage your deliveries
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Online/Offline Toggle */}
                <div className="flex items-center space-x-2 p-2 bg-background rounded-lg border">
                  <Switch
                    id="online-status"
                    checked={isOnline}
                    onCheckedChange={toggleOnlineStatus}
                    disabled={kycStatus !== "approved"}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Label
                    htmlFor="online-status"
                    className={`text-sm font-medium ${
                      kycStatus !== "approved"
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-1 ${
                        isOnline ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </Label>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/delivery-partner/earnings")}
                  >
                    Earnings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/delivery-partner/profile")}
                  >
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Notice - Only show if KYC is not approved */}
        {kycStatus !== "approved" && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">
                    Account Setup & KYC Verification Required
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Complete your profile and upload required documents to start
                    accepting orders.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/delivery-partner/profile")}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Orders Alert - Visual alert for new orders */}
        {isOnline && kycStatus === "approved" && availableOrders.length > 0 && (
          <Card className="border-green-200 bg-green-50 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Package className="h-6 w-6 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">
                    🚨 {availableOrders.length} New Order
                    {availableOrders.length > 1 ? "s" : ""} Available!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Orders are waiting for pickup. Accept now to start earning!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Today's Orders
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {todayOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Deliveries
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {earnings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Today's Earnings
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    Rs {todayEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    Rs {totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Orders - Only show when online and KYC approved */}
        {isOnline && kycStatus === "approved" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableOrders.length > 0 ? (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              {order.profiles?.full_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>
                              {order.profiles?.phone ||
                                order.profiles?.phone_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{order.delivery_address}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.estimated_delivery}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Order Items:</p>
                        {order.order_items?.map((item: any, index: number) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {item.quantity}x {item.products?.name}
                          </p>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold text-lg">
                          Rs{" "}
                          {parseFloat(
                            order.total_amount?.toString() || "0"
                          ).toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectOrder(order.id.toString())}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAcceptOrder(order.id.toString())
                            }
                            disabled={acceptOrderMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {acceptOrderMutation.isPending
                              ? "Accepting..."
                              : "Accept Order"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {kycStatus !== "approved"
                    ? "Complete KYC verification to see available orders."
                    : !isOnline
                    ? "Turn on your status to receive orders."
                    : "No available orders at the moment."}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Active Orders */}
        {myActiveOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                My Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myActiveOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {order.profiles?.full_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>
                            {order.profiles?.phone ||
                              order.profiles?.phone_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{order.delivery_address}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">
                        Rs{" "}
                        {parseFloat(
                          order.total_amount?.toString() || "0"
                        ).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/delivery-partner/navigate/${order.id}`)
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length > 0 ? (
              <div className="space-y-3">
                {recentDeliveries.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{order.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Delivered on{" "}
                        {new Date(order.delivered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rs{" "}
                        {parseFloat(
                          order.total_amount?.toString() || "0"
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent deliveries.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
