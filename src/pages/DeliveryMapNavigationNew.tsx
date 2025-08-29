import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderTimer } from "@/hooks/useOrderTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Timer,
  Package,
  Navigation,
  CheckCircle,
  Truck,
  AlertCircle,
  Map,
} from "lucide-react";
import {
  formatLocationName,
  parseCoordinatesFromAddress,
} from "@/utils/geocoding";

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

// Declare global google types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const DeliveryMapNavigationNew = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Map refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const partnerMarker = useRef<any>(null);
  const customerMarker = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);

  const [partnerLocation, setPartnerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [customerLocationName, setCustomerLocationName] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const watchId = useRef<number | null>(null);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: async () => {
      // Fetch order and order_items
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
        *,
        order_items(
          *,
          products(name, image_url, price)
        )
      `
        )
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Order not found");

      // Fetch profile separately
      let profileData = null;
      if (orderData.user_id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, phone_number, address, location")
          .eq("id", orderData.user_id)
          .maybeSingle();

        if (error) console.warn("Profile fetch error:", error);
        profileData = data;
      }

      // Fetch delivery fee
      const { data: configData } = await supabase
        .from("delivery_config")
        .select("delivery_fee")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      const deliveryFee = configData?.delivery_fee || 50;

      const { data, error } = await supabase.from("profiles").select("*"); // ← just to see what you get

      console.log("Profiles fetch:", data, error);

      return {
        ...orderData,
        user_profile: profileData,
        delivery_fee: deliveryFee,
      };
    },
    enabled: !!orderId,
  });

  // Order timer
  const orderTimer = useOrderTimer({
    orderId: orderId || "",
    orderStatus: order?.status || "pending",
    orderCreatedAt: order?.created_at || "",
    acceptedAt: order?.accepted_at,
    deliveredAt: order?.delivered_at,
  });

  // Load Google Maps and initialize
  useEffect(() => {
    if (!mapContainer.current) return;

    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      window.initGoogleMaps = () => {
        initMap();
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || !window.google || !order) return;

      try {
        const mapInstance = new window.google.maps.Map(mapContainer.current, {
          zoom: 14,
          center: { lat: 27.7172, lng: 85.324 }, // Default Kathmandu center
          mapTypeControl: true,
        });

        directionsService.current = new window.google.maps.DirectionsService();
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#3b82f6",
            strokeWeight: 5,
            strokeOpacity: 0.75,
          },
        });

        directionsRenderer.current.setMap(mapInstance);
        map.current = mapInstance;
        setMapLoaded(true);

        // Geocode customer address and start tracking
        geocodeAddress(order.delivery_address);
        startLocationTracking();
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    loadGoogleMaps();

    return () => {
      stopLocationTracking();
      if (map.current) {
        map.current = null;
      }
    };
  }, [order]);

  // Update route when both locations are available
  useEffect(() => {
    if (
      partnerLocation &&
      customerLocation &&
      map.current &&
      directionsService.current
    ) {
      updateRoute();
    }
  }, [partnerLocation, customerLocation]);

  const geocodeAddress = async (address: string) => {
    try {
      if (!window.google) return;

      // First try to parse if it's coordinates
      const coords = parseCoordinatesFromAddress(address);
      if (coords) {
        setCustomerLocation({ lat: coords.lat, lng: coords.lng });
        const locationName = await formatLocationName(address);
        setCustomerLocationName(locationName);

        // Add customer marker
        if (map.current) {
          if (customerMarker.current) {
            customerMarker.current.setMap(null);
          }

          customerMarker.current = new window.google.maps.Marker({
            position: { lat: coords.lat, lng: coords.lng },
            map: map.current,
            title: "Customer Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
          });
        }
        return;
      }

      // If not coordinates, use geocoding
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          setCustomerLocation({ lat, lng });
          setCustomerLocationName(results[0].formatted_address);

          // Add customer marker
          if (map.current) {
            if (customerMarker.current) {
              customerMarker.current.setMap(null);
            }

            customerMarker.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: map.current,
              title: "Customer Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              },
            });
          }
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      setCustomerLocationName(address);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    setIsTrackingLocation(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePartnerLocation(latitude, longitude);
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position changes
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePartnerLocation(latitude, longitude);
      },
      (error) => console.error("Watch position error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  };

  const stopLocationTracking = () => {
    setIsTrackingLocation(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const updatePartnerLocation = (lat: number, lng: number) => {
    setPartnerLocation({ lat, lng });

    if (map.current) {
      if (partnerMarker.current) {
        partnerMarker.current.setPosition({ lat, lng });
      } else {
        partnerMarker.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: map.current,
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });
      }

      // Center map if first location and no customer location yet
      if (!customerLocation) {
        map.current.setCenter({ lat, lng });
      }
    }
  };

  const updateRoute = async () => {
    if (
      !partnerLocation ||
      !customerLocation ||
      !directionsService.current ||
      !directionsRenderer.current
    )
      return;

    try {
      const request = {
        origin: new window.google.maps.LatLng(
          partnerLocation.lat,
          partnerLocation.lng
        ),
        destination: new window.google.maps.LatLng(
          customerLocation.lat,
          customerLocation.lng
        ),
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.current.route(request, (response: any, status: any) => {
        if (status === "OK") {
          directionsRenderer.current.setDirections(response);

          const route = response.routes[0].legs[0];
          setRouteInfo({
            distance: route.distance.text,
            duration: route.duration.text,
          });
        }
      });
    } catch (error) {
      console.error("Route calculation error:", error);
    }
  };

  const openGoogleMapsNavigation = () => {
    if (customerLocation) {
      // Open Google Maps with navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  // Update order status mutations
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      status,
      notes,
    }: {
      status: string;
      notes?: string;
    }) => {
      const updates: any = { status };

      if (status === "out_for_delivery") {
        updates.picked_up_at = new Date().toISOString();
      } else if (status === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      // Add to status history
      if (orderId) {
        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: status as
            | "pending"
            | "confirmed"
            | "dispatched"
            | "out_for_delivery"
            | "delivered"
            | "cancelled"
            | "ready_for_pickup",
          notes: notes || `Status updated to ${status}`,
        });
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["order-details", orderId] });

      if (status === "out_for_delivery") {
        toast({
          title: "Order Picked Up",
          description: "Navigate to customer location.",
        });
      } else if (status === "delivered") {
        toast({
          title: "Order Delivered",
          description: "Order has been marked as delivered successfully!",
        });

        setTimeout(() => {
          navigate("/delivery-partner/dashboard");
        }, 2000);
      }
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const handlePickup = () => {
    updateOrderMutation.mutate({
      status: "out_for_delivery",
      notes: "Order picked up by delivery partner",
    });
  };

  const handleDelivered = () => {
    updateOrderMutation.mutate({
      status: "delivered",
      notes: `Order delivered successfully`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dispatched":
        return "bg-yellow-100 text-yellow-800";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/delivery-partner/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/delivery-partner/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Order Navigation</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.order_number}
            </p>
          </div>
        </div>

        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">
                {order.user_profile?.full_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium flex items-center gap-2">
                {order.user_profile?.phone_number ||
                  order.user_profile?.phone ||
                  "N/A"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">Delivery Address:</span>
              <p className="font-medium">
                {customerLocationName || order.delivery_address}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Live Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Live Navigation
              {isTrackingLocation && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Live Tracking
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapContainer} className="w-full h-80 rounded-b-lg" />
            {routeInfo && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Distance: <strong>{routeInfo.distance}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-blue-600" />
                    ETA: <strong>{routeInfo.duration}</strong>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timer Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">Order Timer</span>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold text-lg ${
                    orderTimer.isOverdue ? "text-red-600" : "text-primary"
                  }`}
                >
                  {orderTimer.formatRemaining()}
                </div>
                {orderTimer.isOverdue && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">Overdue</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Order Status:</span>
              <Badge className={getStatusColor(order.status || "pending")}>
                {order.status?.replace("_", " ") || "pending"}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={openGoogleMapsNavigation}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!customerLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Customer Location
              </Button>

              {order.status === "dispatched" && (
                <Button
                  onClick={handlePickup}
                  className="w-full"
                  disabled={updateOrderMutation.isPending}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}

              {order.status === "out_for_delivery" && (
                <Button
                  onClick={handleDelivered}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={updateOrderMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryMapNavigationNew;
