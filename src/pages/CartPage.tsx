
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

  // Load delivery location from localStorage
  useEffect(() => {
    try {
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
    }
  }, []);

  const handleAutoDetect = () => {
    setButtonClicked('auto');
    setIsDetecting(true);
    
    // Reset button color after 200ms
    setTimeout(() => setButtonClicked(null), 200);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
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
    }
  };

  const handleSetManually = () => {
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Cart ({totalItems} items)</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Delivery in 10-15 mins
                </span>
              </div>
            </div>

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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Delivery Location
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Current Location</Label>
                  <Input 
                    id="address"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="mt-1"
                    placeholder="Enter delivery address"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    variant="outline"
                    className={`flex-1 transition-colors ${
                      buttonClicked === 'auto' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'hover:bg-green-50 hover:border-green-300'
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
                  
                  <Button
                    onClick={handleSetManually}
                    variant="outline"
                    className={`flex-1 transition-colors ${
                      buttonClicked === 'manual' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'hover:bg-green-50 hover:border-green-300'
                    }`}
                  >
                    Set Manually
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>Rs{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>Rs{deliveryFee}</span>
              </div>
              {deliveryFee === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Free delivery on orders above Rs200
                </Badge>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Delivery in 10-15 mins</span>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
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
