import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderTimer } from '@/hooks/useOrderTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
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
  Map
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatLocationName, parseCoordinatesFromAddress } from '@/utils/geocoding';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia3Jpc2huYTEyNDMzNCIsImEiOiJjbWVodG1mZjcwMjhwMnJxczZ1ZWQyeTNlIn0.pl7sk2526OEU-Ub-hB0QTQ';

const DeliveryMapNavigation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Map refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const partnerMarker = useRef<mapboxgl.Marker | null>(null);
  const customerMarker = useRef<mapboxgl.Marker | null>(null);
  const routeSource = useRef<any>(null);
  
  const [partnerLocation, setPartnerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [customerLocationName, setCustomerLocationName] = useState<string>('');
  const watchId = useRef<number | null>(null);
  

  // Fetch order details with delivery config
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const [orderResponse, configResponse] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            profiles!orders_user_id_fkey(full_name, phone_number, address, location),
            order_items(
              *,
              products(name, image_url, price)
            ),
            user_profile:profiles!orders_user_id_fkey ( full_name, phone_number, address, location )
          `)
          .eq('id', orderId)
          .single(),
        supabase
          .from('delivery_config')
          .select('delivery_fee')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()
      ]);

      if (orderResponse.error) throw orderResponse.error;
      
      const deliveryFee = configResponse.data?.delivery_fee || 50;
      return { ...orderResponse.data, delivery_fee: deliveryFee };
    },
    enabled: !!orderId
  });

  // Order timer for delivery partner tracking
  const orderTimer = useOrderTimer({
    orderId: orderId || '',
    orderStatus: order?.status || 'pending',
    orderCreatedAt: order?.created_at || '',
    acceptedAt: order?.accepted_at,
    deliveredAt: order?.delivered_at
  });


  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      const updates: any = { status };
      
      if (status === 'out_for_delivery') {
        updates.picked_up_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Add to status history
      if (orderId) {
        await supabase
          .from('order_status_history')
          .insert({
            order_id: orderId,
            status: status as 'pending' | 'confirmed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'ready_for_pickup',
            notes: notes || `Status updated to ${status}`
          });
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      
      if (status === 'out_for_delivery') {
        toast({
          title: "Order Picked Up",
          description: "Navigate to customer location.",
        });
      } else if (status === 'delivered') {
        
        // Show success modal
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 400px; text-align: center; margin: 1rem;">
              <div style="color: #10b981; font-size: 4rem; margin-bottom: 1rem;">✓</div>
              <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #1f2937;">Order Delivered Successfully!</h2>
              <p style="color: #6b7280; margin-bottom: 2rem;">Great job! The order has been marked as delivered.</p>
              <button id="backToDashboard" style="background: #10b981; color: white; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; width: 100%;">
                Back to Dashboard
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('backToDashboard')?.addEventListener('click', () => {
          document.body.removeChild(modal);
          navigate('/delivery-partner/dashboard');
        });
      }
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  });

  const handlePickup = () => {
    updateOrderMutation.mutate({ 
      status: 'out_for_delivery', 
      notes: 'Order picked up by delivery partner' 
    });
  };

  const handleDelivered = () => {
    updateOrderMutation.mutate({ 
      status: 'delivered', 
      notes: `Order delivered successfully` 
    });
  };

  // Initialize map and location tracking
  useEffect(() => {
    if (!mapContainer.current || !order) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [85.3240, 27.7172], // Default Kathmandu center
      zoom: 14
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Geocode customer address
    geocodeAddress(order.delivery_address);
    
    // Start location tracking for delivery partner
    startLocationTracking();

    return () => {
      stopLocationTracking();
      if (map.current) {
        map.current.remove();
      }
    };
  }, [order]);

  // Update route when both locations are available
  useEffect(() => {
    if (partnerLocation && customerLocation && map.current) {
      updateRoute();
    }
  }, [partnerLocation, customerLocation]);

  const geocodeAddress = async (address: string) => {
    try {
      // First try to parse if it's coordinates
      const coords = parseCoordinatesFromAddress(address);
      if (coords) {
        setCustomerLocation({ lat: coords.lat, lng: coords.lng });
        const locationName = await formatLocationName(address);
        setCustomerLocationName(locationName);
        
        // Add customer marker
        if (map.current) {
          if (customerMarker.current) {
            customerMarker.current.remove();
          }
          
          customerMarker.current = new mapboxgl.Marker({ 
            color: '#ef4444',
            scale: 1.2 
          })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Customer Location</strong><br>' + locationName + '</div>'))
          .addTo(map.current);
        }
        return;
      }

      // If not coordinates, use geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=NP&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCustomerLocation({ lat, lng });
          setCustomerLocationName(data.features[0].place_name);
          
          // Add customer marker
          if (map.current) {
            if (customerMarker.current) {
              customerMarker.current.remove();
            }
            
            customerMarker.current = new mapboxgl.Marker({ 
              color: '#ef4444',
              scale: 1.2 
            })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Customer Location</strong><br>' + data.features[0].place_name + '</div>'))
            .addTo(map.current);
          }
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setCustomerLocationName(address); // Fallback to original address
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
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position changes
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePartnerLocation(latitude, longitude);
      },
      (error) => console.error('Watch position error:', error),
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
        partnerMarker.current.setLngLat([lng, lat]);
      } else {
        partnerMarker.current = new mapboxgl.Marker({ 
          color: '#10b981',
          scale: 1.2 
        })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Your Location</strong><br>Delivery Partner</div>'))
        .addTo(map.current);
      }
      
      // Center map if first location
      if (!customerLocation) {
        map.current.setCenter([lng, lat]);
      }
    }
  };

  const updateRoute = async () => {
    if (!partnerLocation || !customerLocation || !map.current) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${partnerLocation.lng},${partnerLocation.lat};${customerLocation.lng},${customerLocation.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Update route info
          const distance = (route.distance / 1000).toFixed(1) + ' km';
          const duration = Math.round(route.duration / 60) + ' min';
          setRouteInfo({ distance, duration });
          
          // Add route to map
          if (map.current.getSource('route')) {
            (map.current.getSource('route') as any).setData(route.geometry);
          } else {
            map.current.addSource('route', {
              type: 'geojson',
              data: route.geometry
            });
            
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
          }
          
          // Fit map to show both locations
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([partnerLocation.lng, partnerLocation.lat]);
          bounds.extend([customerLocation.lng, customerLocation.lat]);
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const openMap = () => {
    if (customerLocation) {
      // Store location coordinates
      const storeLocation = "27.687421,85.340841";
      // Navigate from store to customer location
      const url = `https://www.google.com/maps/dir/${storeLocation}/${customerLocation.lat},${customerLocation.lng}`;
      window.open(url, '_blank');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/delivery-partner/dashboard')}>
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
            onClick={() => navigate('/delivery-partner/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Order Navigation</h1>
            <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Live Map */}
        <Card className="mb-6">
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
            <div 
              ref={mapContainer}
              className="w-full h-80 rounded-b-lg"
            />
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
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">Delivery Timer</span>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${orderTimer.isOverdue ? 'text-red-600' : 'text-primary'}`}>
                  {orderTimer.deliveryPartnerRemaining !== null 
                    ? orderTimer.formatDeliveryPartnerRemaining() 
                    : orderTimer.formatRemaining()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {orderTimer.deliveryPartnerRemaining !== null ? 'Your remaining time' : 'Total remaining'}
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

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.status === 'dispatched' && (
                <Button 
                  onClick={handlePickup}
                  disabled={updateOrderMutation.isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              
              {(order.status === 'out_for_delivery' || order.status === 'dispatched') && (
                <Button 
                  onClick={handleDelivered}
                  disabled={updateOrderMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
              
              <Button 
                onClick={openMap}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to User's Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.profiles?.full_name || order.user_profile?.full_name || 'Not available'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${order.profiles?.phone_number || order.user_profile?.phone_number || ''}`}
                className="text-blue-600 hover:underline"
              >
                {order.profiles?.phone_number || order.user_profile?.phone_number || 'Not available'}
              </a>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Customer Address:</div>
                <span className="text-sm font-medium">{order.profiles?.address || order.user_profile?.address || order.delivery_address}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Delivery Address:</div>
                <span className="text-sm font-medium">{customerLocationName || order.delivery_address || 'N/A'}</span>
              </div>
            </div>
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
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-medium">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3 space-y-2">
                {/* Items Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Subtotal</span>
                  <span className="font-medium">
                    Rs {order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
                
                {/* Delivery Fee */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">Rs {order.delivery_fee?.toFixed(2) || '50.00'}</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span>Rs {parseFloat(order.total_amount?.toString() || '0').toFixed(2)}</span>
                </div>
                
                {/* Timer Info */}
                {order.status === 'delivered' && order.delivery_time_minutes && (
                  <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
                    <span>Actual Delivery Time</span>
                    <span>{Math.floor(order.delivery_time_minutes)} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryMapNavigation;