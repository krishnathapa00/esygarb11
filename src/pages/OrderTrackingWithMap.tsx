// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   ArrowLeft,
//   Package,
//   Truck,
//   CheckCircle,
//   Clock,
//   MapPin,
//   Phone,
//   Timer,
//   AlertCircle,
//   Map,
// } from "lucide-react";
// import Header from "@/components/Header";
// import { useOrderTimer } from "@/hooks/useOrderTimer";
// import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

// const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

// const containerStyle = {
//   width: "100%",
//   height: "320px",
// };

// const centerDefault = {
//   lat: 27.7172,
//   lng: 85.324,
// };

// const OrderTrackingWithMap = () => {
//   const { orderId } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Map refs and state
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<google.maps.Map | null>(null);

//   const [customerLocation, setCustomerLocation] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [deliveryLocation, setDeliveryLocation] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [customerLocationName, setCustomerLocationName] = useState<string>("");

//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: GOOGLE_MAPS_API_KEY,
//   });

//   const [isCancelling, setIsCancelling] = useState(false);
//   const [cancelled, setCancelled] = useState(false);

//   const isCancellationAllowed = () => {
//     if (!order || cancelled) return false;
//     if (order.status !== "pending" && order.status !== "confirmed")
//       return false;
//     const orderCreated = new Date(order.created_at).getTime();
//     const now = Date.now();
//     const diffMinutes = (now - orderCreated) / 1000 / 60;
//     return diffMinutes <= 2;
//   };

//   const cancelOrder = async () => {
//     if (!orderId) return;
//     setIsCancelling(true);
//     try {
//       const { data, error } = await supabase
//         .from("orders")
//         .update({ status: "cancelled" })
//         .eq("id", orderId)
//         .select()
//         .single();

//       if (error) throw error;

//       setCancelled(true);
//       orderTimer.stopTimer?.();
//       await refetch();
//     } catch (err) {
//       console.error("Cancel order error:", err);
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   // Fetch order details
//   const {
//     data: order,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ["order-tracking", orderId],
//     queryFn: async () => {
//       if (!orderId) throw new Error("Order ID is required");

//       // Check if orderId is an order number (starts with "ORD") or a UUID
//       const isOrderNumber = orderId.startsWith("ORD");
//       const queryField = isOrderNumber ? "order_number" : "id";

//       const { data, error } = await supabase
//         .from("orders")
//         .select(
//           `
//           *,
//           order_items (
//             id,
//             quantity,
//             price,
//             products (
//               name,
//               image_url
//             )
//           ),
//           profiles!orders_delivery_partner_id_fkey (
//             full_name,
//             phone_number
//           )
//         `
//         )
//         .eq(queryField, orderId)
//         .maybeSingle();

//       if (error) throw error;
//       return data;
//     },
//     enabled: !!orderId,
//     refetchInterval: 5000, // Refresh every 5 seconds
//   });

//   // Order timer for 10-minute delivery tracking
//   const orderTimer = useOrderTimer({
//     orderId: orderId || "",
//     orderStatus: order?.status || "pending",
//     orderCreatedAt: order?.created_at || "",
//     acceptedAt: order?.accepted_at,
//     deliveredAt: order?.delivered_at,
//     isCancelled: cancelled,
//   });

//   const geocodeAddress = async (address: string) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//           address
//         )}&key=${GOOGLE_MAPS_API_KEY}`
//       );
//       const data = await response.json();
//       if (data.status === "OK") {
//         const location = data.results[0].geometry.location;
//         setCustomerLocation({ lat: location.lat, lng: location.lng });
//         setCustomerLocationName(data.results[0].formatted_address);
//       } else {
//         setCustomerLocationName(address);
//       }
//     } catch (err) {
//       console.error("Google geocode error:", err);
//       setCustomerLocationName(address);
//     }
//   };

//   useEffect(() => {
//     if (order && order.delivery_address) {
//       geocodeAddress(order.delivery_address);
//     }
//   }, [order]);

//   const getOrderProgress = (status: string) => {
//     switch (status) {
//       case "pending":
//         return 10;
//       case "confirmed":
//         return 25;
//       case "ready_for_pickup":
//         return 40;
//       case "dispatched":
//         return 60;
//       case "out_for_delivery":
//         return 80;
//       case "delivered":
//         return 100;
//       default:
//         return 0;
//     }
//   };

//   const getStatusIcon = (status: string, currentStatus: string) => {
//     const isCompleted =
//       getOrderProgress(status) <= getOrderProgress(currentStatus);
//     const isCurrent = status === currentStatus;

//     if (status === "delivered" && isCompleted) {
//       return <CheckCircle className="h-6 w-6 text-green-600" />;
//     }

//     if (isCurrent) {
//       return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
//     }

//     if (isCompleted) {
//       return <CheckCircle className="h-6 w-6 text-green-600" />;
//     }

//     return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "confirmed":
//         return "bg-blue-100 text-blue-800";
//       case "ready_for_pickup":
//         return "bg-purple-100 text-purple-800";
//       case "dispatched":
//         return "bg-orange-100 text-orange-800";
//       case "out_for_delivery":
//         return "bg-indigo-100 text-indigo-800";
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const statusSteps = [
//     {
//       status: "pending",
//       label: "Order Placed",
//       description: "Your order has been received",
//     },
//     {
//       status: "confirmed",
//       label: "Processing",
//       description: "Order is being prepared",
//     },
//     {
//       status: "ready_for_pickup",
//       label: "Ready",
//       description: "Order ready for pickup",
//     },
//     {
//       status: "dispatched",
//       label: "Picked Up",
//       description: "Delivery partner assigned",
//     },
//     {
//       status: "out_for_delivery",
//       label: "On the Way",
//       description: "Order is being delivered",
//     },
//     {
//       status: "delivered",
//       label: "Delivered",
//       description: "Order delivered successfully",
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto p-4">
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//             <p className="mt-4 text-muted-foreground">
//               Loading order details...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto p-4">
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">Order not found</p>
//             <Button onClick={() => navigate("/")} className="mt-4">
//               Back to Home
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }
//   if (loadError) return <div>Error loading maps</div>;
//   if (!isLoaded) return <div>Loading map...</div>;

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <div className="container mx-auto p-4 space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => navigate("/profile")}
//           >
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">Order Tracking</h1>
//             <p className="text-muted-foreground">Order #{order.order_number}</p>
//           </div>
//         </div>

//         {/* Live Map - Only show if order is dispatched or out for delivery */}
//         {(order.status === "dispatched" ||
//           order.status === "out_for_delivery") && (
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Map className="h-5 w-5" />
//                 Live Order Tracking
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 center={customerLocation || centerDefault}
//                 zoom={14}
//               >
//                 {customerLocation && (
//                   <Marker
//                     position={customerLocation}
//                     label="Delivery Location"
//                   />
//                 )}
//                 {/* Add delivery partner marker similarly when you have their location */}
//               </GoogleMap>
//               <div className="p-4 bg-gray-50 border-t">
//                 <p className="text-sm text-muted-foreground text-center">
//                   Your order is on the way! Track your delivery partner's
//                   location in real-time.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Timer and Status */}
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <Badge className={getStatusColor(order.status)}>
//                   {cancelled
//                     ? "CANCELLED"
//                     : order.status.replace("_", " ").toUpperCase()}
//                 </Badge>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Estimated delivery: {order.estimated_delivery}
//                 </p>
//               </div>

//               {cancelled ? (
//                 <p className="text-red-600 font-semibold">Order Cancelled</p>
//               ) : (
//                 <div className="text-right space-y-1">
//                   <div className="flex items-center gap-2 justify-end">
//                     <Timer className="h-4 w-4 text-primary" />
//                     <p
//                       className={`text-2xl font-bold ${
//                         orderTimer.isOverdue ? "text-red-600" : "text-primary"
//                       }`}
//                     >
//                       {orderTimer.formatRemaining()}
//                     </p>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     Remaining time
//                   </p>
//                   {orderTimer.isOverdue && (
//                     <div className="flex items-center gap-1 text-red-600">
//                       <AlertCircle className="h-3 w-3" />
//                       <span className="text-xs">Overdue</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {isCancellationAllowed() && !cancelled && (
//               <div className="flex justify-end mt-2">
//                 <Button
//                   variant="destructive"
//                   disabled={isCancelling}
//                   onClick={cancelOrder}
//                 >
//                   {isCancelling ? "Cancelling..." : "Cancel Order"}
//                 </Button>
//               </div>
//             )}

//             <div className="flex justify-between text-sm text-muted-foreground mb-2">
//               <span>Time elapsed: {orderTimer.formatElapsed()}</span>
//               {order.status === "delivered" && order.delivery_time_minutes && (
//                 <span>
//                   Total delivery time: {Math.floor(order.delivery_time_minutes)}{" "}
//                   minutes
//                 </span>
//               )}
//             </div>
//             <Progress value={getOrderProgress(order.status)} className="h-2" />
//           </CardContent>
//         </Card>

//         {/* Order Status Timeline */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Order Progress</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {statusSteps.map((step, index) => (
//                 <div key={step.status} className="flex items-center gap-4">
//                   {getStatusIcon(step.status, order.status)}
//                   <div className="flex-1">
//                     <h3 className="font-medium">{step.label}</h3>
//                     <p className="text-sm text-muted-foreground">
//                       {step.description}
//                     </p>
//                   </div>
//                   {step.status === order.status && (
//                     <Badge variant="outline" className="text-blue-600">
//                       Current
//                     </Badge>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Delivery Partner Info */}
//         {order.delivery_partner_id && order.profiles && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Truck className="h-5 w-5" />
//                 Delivery Partner
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center gap-3">
//                 <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
//                   <Truck className="h-6 w-6 text-primary" />
//                 </div>
//                 <div>
//                   <p className="font-medium">{order.profiles.full_name}</p>
//                   <p className="text-sm text-muted-foreground flex items-center gap-1">
//                     <Phone className="h-4 w-4" />
//                     {order.profiles.phone_number}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Delivery Address */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <MapPin className="h-5 w-5" />
//               Delivery Address
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm">
//               {customerLocationName || order.delivery_address}
//             </p>
//           </CardContent>
//         </Card>

//         {/* Order Items */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Package className="h-5 w-5" />
//               Order Items
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {order.order_items?.map((item: any, index: number) => (
//                 <div
//                   key={item.id}
//                   className="flex items-center gap-3 p-2 border rounded-lg"
//                 >
//                   <img
//                     src={item.products?.image_url || "/placeholder.svg"}
//                     alt={item.products?.name}
//                     className="h-12 w-12 object-cover rounded"
//                   />
//                   <div className="flex-1">
//                     <p className="font-medium">{item.products?.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       Qty: {item.quantity}
//                     </p>
//                   </div>
//                   <p className="font-medium">
//                     Rs {parseFloat(item.price).toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <div className="border-t pt-3 mt-3">
//               <div className="flex justify-between items-center font-medium">
//                 <span>Total Amount</span>
//                 <span>
//                   Rs {parseFloat(String(order.total_amount)).toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default OrderTrackingWithMap;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Timer,
  AlertCircle,
  Map,
} from "lucide-react";
import Header from "@/components/Header";
import { useOrderTimer } from "@/hooks/useOrderTimer";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

const containerStyle = {
  width: "100%",
  height: "320px",
};

const centerDefault = {
  lat: 27.7172,
  lng: 85.324,
};

const OrderTrackingWithMap = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Map refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  const [customerLocation, setCustomerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customerLocationName, setCustomerLocationName] = useState<string>("");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // Fetch order details
  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      // Check if orderId is an order number (starts with "ORD") or a UUID
      const isOrderNumber = orderId.startsWith("ORD");
      const queryField = isOrderNumber ? "order_number" : "id";

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
          ),
          profiles!orders_delivery_partner_id_fkey (
            full_name,
            phone_number
          )
        `
        )
        .eq(queryField, orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Order timer for 10-minute delivery tracking
  const orderTimer = useOrderTimer({
    orderId: orderId || "",
    orderStatus: order?.status || "pending",
    orderCreatedAt: order?.created_at || "",
    acceptedAt: order?.accepted_at,
    deliveredAt: order?.delivered_at,
    isCancelled: cancelled,
  });

  const isCancellationAllowed = () => {
    if (!order || cancelled) return false;
    if (order.status !== "pending" && order.status !== "confirmed")
      return false;
    const orderCreated = new Date(order.created_at).getTime();
    const now = Date.now();
    const diffMinutes = (now - orderCreated) / 1000 / 60;
    return diffMinutes <= 2;
  };

  const cancelOrder = async () => {
    if (!orderId) return;
    setIsCancelling(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      setCancelled(true);
      orderTimer.stopTimer?.();
      await refetch();
    } catch (err) {
      console.error("Cancel order error:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        setCustomerLocation({ lat: location.lat, lng: location.lng });
        setCustomerLocationName(data.results[0].formatted_address);
      } else {
        setCustomerLocationName(address);
      }
    } catch (err) {
      console.error("Google geocode error:", err);
      setCustomerLocationName(address);
    }
  };

  useEffect(() => {
    if (order && order.delivery_address) {
      geocodeAddress(order.delivery_address);
    }
  }, [order]);

  const getOrderProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 10;
      case "confirmed":
        return 25;
      case "ready_for_pickup":
        return 40;
      case "dispatched":
        return 60;
      case "out_for_delivery":
        return 80;
      case "delivered":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string, currentStatus: string) => {
    const isCompleted =
      getOrderProgress(status) <= getOrderProgress(currentStatus);
    const isCurrent = status === currentStatus;

    if (status === "delivered" && isCompleted) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }

    if (isCurrent) {
      return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
    }

    if (isCompleted) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }

    return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800";
      case "dispatched":
        return "bg-orange-100 text-orange-800";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusSteps = [
    {
      status: "pending",
      label: "Order Placed",
      description: "Your order has been received",
    },
    {
      status: "confirmed",
      label: "Processing",
      description: "Order is being prepared",
    },
    {
      status: "ready_for_pickup",
      label: "Ready",
      description: "Order ready for pickup",
    },
    {
      status: "dispatched",
      label: "Picked Up",
      description: "Delivery partner assigned",
    },
    {
      status: "out_for_delivery",
      label: "On the Way",
      description: "Order is being delivered",
    },
    {
      status: "delivered",
      label: "Delivered",
      description: "Order delivered successfully",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Order not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Tracking</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Live Map - Only show if order is dispatched or out for delivery */}
        {(order.status === "dispatched" ||
          order.status === "out_for_delivery") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Live Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={customerLocation || centerDefault}
                zoom={14}
              >
                {customerLocation && (
                  <Marker
                    position={customerLocation}
                    label="Delivery Location"
                  />
                )}
                {/* Add delivery partner marker similarly when you have their location */}
              </GoogleMap>
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Your order is on the way! Track your delivery partner's
                  location in real-time.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timer and Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <Badge className={getStatusColor(order.status)}>
                  {cancelled
                    ? "CANCELLED"
                    : order.status.replace("_", " ").toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated delivery: {order.estimated_delivery}
                </p>
              </div>

              {cancelled ? (
                <p className="text-red-600 font-semibold">Order Cancelled</p>
              ) : (
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2 justify-end">
                    <Timer className="h-4 w-4 text-primary" />
                    <p
                      className={`text-2xl font-bold ${
                        orderTimer.isOverdue ? "text-red-600" : "text-primary"
                      }`}
                    >
                      {orderTimer.formatRemaining()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remaining time
                  </p>
                  {orderTimer.isOverdue && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs">Overdue</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isCancellationAllowed() && !cancelled && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="destructive"
                  disabled={isCancelling}
                  onClick={cancelOrder}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            )}

            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Time elapsed: {orderTimer.formatElapsed()}</span>
              {order.status === "delivered" && order.delivery_time_minutes && (
                <span>
                  Total delivery time: {Math.floor(order.delivery_time_minutes)}{" "}
                  minutes
                </span>
              )}
            </div>
            <Progress value={getOrderProgress(order.status)} className="h-2" />
          </CardContent>
        </Card>

        {/* Order Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex items-center gap-4">
                  {getStatusIcon(step.status, order.status)}
                  <div className="flex-1">
                    <h3 className="font-medium">{step.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {step.status === order.status && (
                    <Badge variant="outline" className="text-blue-600">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Partner Info */}
        {order.delivery_partner_id && order.profiles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Partner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{order.profiles.full_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {order.profiles.phone_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {customerLocationName || order.delivery_address}
            </p>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 border rounded-lg"
                >
                  <img
                    src={item.products?.image_url || "/placeholder.svg"}
                    alt={item.products?.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rs {parseFloat(item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center font-medium">
                <span>Total Amount</span>
                <span>
                  Rs {parseFloat(String(order.total_amount)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingWithMap;
