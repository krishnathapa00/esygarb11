<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Truck, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CartPage = () => {
  const navigate = useNavigate();
  const [deliveryLocation, setDeliveryLocation] = useState('Set delivery location');
  const [isDetecting, setIsDetecting] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<'auto' | 'manual' | null>(null);
=======
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Truck, Clock, MapPin, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart: cartItems, updateQuantity, removeItem } = useCart();

  const [deliveryLocation, setDeliveryLocation] = useState(
    "Set delivery location"
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<"auto" | "manual" | null>(
    null
  );
>>>>>>> 398f62f (code pushed by undead)

  // Load delivery location from localStorage
  useEffect(() => {
    try {
<<<<<<< HEAD
      const savedLocation = localStorage.getItem('esygrab_user_location');
      if (savedLocation && savedLocation !== 'null' && savedLocation !== 'undefined') {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          if (parsedLocation && typeof parsedLocation === 'object' && parsedLocation.address) {
            setDeliveryLocation(parsedLocation.address);
          }
        } catch (parseError) {
          console.error('Error parsing saved location:', parseError);
          localStorage.removeItem('esygrab_user_location');
          setDeliveryLocation('Set delivery location');
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
      setDeliveryLocation('Set delivery location');
=======
      const savedLocation = localStorage.getItem("esygrab_user_location");
      if (
        savedLocation &&
        savedLocation !== "null" &&
        savedLocation !== "undefined"
      ) {
        const parsed = JSON.parse(savedLocation);
        if (parsed?.address) {
          setDeliveryLocation(parsed.address);
        }
      }
    } catch (err) {
      console.error("Failed to load location from localStorage", err);
>>>>>>> 398f62f (code pushed by undead)
    }
  }, []);

  const handleAutoDetect = () => {
<<<<<<< HEAD
    setButtonClicked('auto');
    setIsDetecting(true);
    
    // Reset button color after 200ms
    setTimeout(() => setButtonClicked(null), 200);
    
=======
    setButtonClicked("auto");
    setIsDetecting(true);
    setTimeout(() => setButtonClicked(null), 200);

>>>>>>> 398f62f (code pushed by undead)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
<<<<<<< HEAD
            console.log('Location detected:', position.coords.latitude, position.coords.longitude);
            
            // Using OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              console.log('Geocoding response:', data);
              
              // Extract meaningful address components
              const address = data.address || {};
              const locationParts = [];
              
              if (address.house_number && address.road) {
                locationParts.push(`${address.house_number} ${address.road}`);
              } else if (address.road) {
                locationParts.push(address.road);
              }
              
              if (address.neighbourhood || address.suburb) {
                locationParts.push(address.neighbourhood || address.suburb);
              }
              
              if (address.city || address.town || address.village) {
                locationParts.push(address.city || address.town || address.village);
              }
              
              if (address.state) {
                locationParts.push(address.state);
              }
              
              const formattedLocation = locationParts.length > 0 
                ? locationParts.join(', ')
                : data.display_name || 'Location detected successfully';
              
              console.log('Formatted location:', formattedLocation);
              setDeliveryLocation(formattedLocation);
              
              // Save to localStorage
              localStorage.setItem('esygrab_user_location', JSON.stringify({
                address: formattedLocation,
                coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }
              }));
            } else {
              console.log('Geocoding failed, using coordinates');
              const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
              setDeliveryLocation(fallbackLocation);
              localStorage.setItem('esygrab_user_location', JSON.stringify({
                address: fallbackLocation,
                coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }
              }));
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
            setDeliveryLocation(fallbackLocation);
            localStorage.setItem('esygrab_user_location', JSON.stringify({
              address: fallbackLocation,
              coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }
            }));
          }
          setIsDetecting(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetecting(false);
          
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          alert(errorMessage);
        }
      );
    } else {
      setIsDetecting(false);
      alert('Geolocation is not supported by this browser.');
=======
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );

            const data = await response.json();
            const address = data?.address || {};
            const parts = [
              address.house_number && address.road
                ? `${address.house_number} ${address.road}`
                : address.road,
              address.neighbourhood || address.suburb,
              address.city || address.town || address.village,
              address.state,
            ].filter(Boolean);

            const formatted =
              parts.join(", ") || data.display_name || "Detected Location";
            setDeliveryLocation(formatted);

            localStorage.setItem(
              "esygrab_user_location",
              JSON.stringify({
                address: formatted,
                coordinates: { lat: latitude, lng: longitude },
              })
            );
          } catch (err) {
            console.error("Geolocation failed:", err);
            const fallback = `Lat: ${position.coords.latitude.toFixed(
              4
            )}, Lng: ${position.coords.longitude.toFixed(4)}`;
            setDeliveryLocation(fallback);
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Failed to access your location. Please enable location services."
          );
          setIsDetecting(false);
        }
      );
    } else {
      alert("Geolocation not supported by this browser.");
      setIsDetecting(false);
>>>>>>> 398f62f (code pushed by undead)
    }
  };

  const handleSetManually = () => {
<<<<<<< HEAD
    setButtonClicked('manual');
    // Reset button color after 200ms
    setTimeout(() => setButtonClicked(null), 200);
    navigate('/map-location');
  };

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: "Fresh Bananas",
      price: 40,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      weight: "1 kg",
      quantity: 2
    },
    {
      id: 2,
      name: "Fresh Milk",
      price: 60,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
      weight: "1 L",
      quantity: 1
    },
  ];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
=======
    setButtonClicked("manual");
    setTimeout(() => setButtonClicked(null), 200);
    navigate("/map-location");
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
>>>>>>> 398f62f (code pushed by undead)
  const deliveryFee = totalPrice > 200 ? 0 : 20;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={totalItems}
        onCartClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />
<<<<<<< HEAD
      
=======

>>>>>>> 398f62f (code pushed by undead)
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-gray-900">My Cart ({totalItems} items)</h1>
        </div>

        {/* Delivery Info moved to just below header */}
=======
          <h1 className="text-2xl font-bold text-gray-900">
            My Cart ({totalItems} items)
          </h1>
        </div>

>>>>>>> 398f62f (code pushed by undead)
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-6">
          <Truck className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Delivery in 10-15 mins
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
<<<<<<< HEAD
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.weight}</p>
                    <p className="font-semibold text-green-600">Rs{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Delivery Location Selection */}
=======
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-medium">
                Your cart is empty.
                <br />
                <Link to="/" className="text-green-600 underline">
                  Continue shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.weight}</p>
                      <p className="font-semibold text-green-600">
                        Rs.{item.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <span className="font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}

>>>>>>> 398f62f (code pushed by undead)
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Delivery Location
              </h3>
<<<<<<< HEAD
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Current Location</Label>
                  <Input 
=======

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Current Location</Label>
                  <Input
>>>>>>> 398f62f (code pushed by undead)
                    id="address"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="mt-1"
                    placeholder="Enter delivery address"
                  />
                </div>
<<<<<<< HEAD
                
=======

>>>>>>> 398f62f (code pushed by undead)
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    variant="outline"
                    className={`flex-1 transition-colors ${
<<<<<<< HEAD
                      buttonClicked === 'auto' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'hover:bg-green-50 hover:border-green-300'
=======
                      buttonClicked === "auto"
                        ? "bg-green-500 text-white border-green-500"
                        : "hover:bg-green-50 hover:border-green-300"
>>>>>>> 398f62f (code pushed by undead)
                    }`}
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Auto Detect
                      </>
                    )}
                  </Button>
<<<<<<< HEAD
                  
=======

>>>>>>> 398f62f (code pushed by undead)
                  <Button
                    onClick={handleSetManually}
                    variant="outline"
                    className={`flex-1 transition-colors ${
<<<<<<< HEAD
                      buttonClicked === 'manual' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'hover:bg-green-50 hover:border-green-300'
=======
                      buttonClicked === "manual"
                        ? "bg-green-500 text-white border-green-500"
                        : "hover:bg-green-50 hover:border-green-300"
>>>>>>> 398f62f (code pushed by undead)
                    }`}
                  >
                    Set Manually
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-2xl p-6 shadow-lg h-fit border border-green-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block bg-green-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </span>
              <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
            </div>
<<<<<<< HEAD
            <div className="mb-6">
              {/* Breakdown */}
              <div className="space-y-2 text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium text-gray-900">Rs{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "font-medium text-green-600" : "font-medium text-gray-900"}>
                    Rs{deliveryFee}
                  </span>
                </div>
                {deliveryFee === 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1">Free delivery on orders above Rs200</Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-dashed border-green-200 mb-3">
              <span className="font-semibold text-lg text-gray-800">Total</span>
              <span className="font-extrabold text-2xl text-emerald-600 tracking-tight">Rs{finalTotal}</span>
            </div>
=======
            <div className="mb-6 space-y-2 text-base">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">
                  Rs.{totalPrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Fee</span>
                <span
                  className={
                    deliveryFee === 0
                      ? "text-green-600 font-medium"
                      : "text-gray-900 font-medium"
                  }
                >
                  Rs.{deliveryFee}
                </span>
              </div>
              {deliveryFee === 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 mt-1">
                  Free delivery on orders above Rs200
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center py-4 border-t border-dashed border-green-200 mb-3">
              <span className="font-semibold text-lg text-gray-800">Total</span>
              <span className="font-extrabold text-2xl text-emerald-600 tracking-tight">
                Rs.{finalTotal}
              </span>
            </div>

>>>>>>> 398f62f (code pushed by undead)
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600 pb-1">
                <Truck className="h-4 w-4" />
                <span>Delivery in 10-15 mins</span>
              </div>
              <Link to="/checkout">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-lg font-bold rounded-lg shadow-green-100 shadow-md transition-all">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
