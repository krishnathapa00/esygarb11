import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, User, Loader2 } from "lucide-react";
import GPSPermissionPopup from "./GPSPermissionPopup";

interface UserDetailsFormProps {
  email: string;
  onComplete: (details: { fullName: string; deliveryAddress: string }) => void;
  loading?: boolean;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  email,
  onComplete,
  loading = false,
}) => {
  const [fullName, setFullName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showGPSPopup, setShowGPSPopup] = useState(false);
  const { toast } = useToast();

  // Check if user already has location from homepage on component mount
  useEffect(() => {
    const storedLocation = localStorage.getItem("esygrab_user_location");
    if (storedLocation) {
      try {
        const locationData = JSON.parse(storedLocation);
        if (locationData.formatted && !deliveryAddress) {
          setDeliveryAddress(locationData.formatted);
          toast({
            title: "Location auto-filled",
            description: "Your previously detected location has been used",
          });
        }
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      });
      return;
    }

    setDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('High-accuracy location detected:', position.coords.latitude, position.coords.longitude);
          
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Check if user is within Nepal coordinates (rough bounds)
          const isInNepal = lat >= 26 && lat <= 31 && lng >= 80 && lng <= 89;
          
          if (!isInNepal) {
            setDetectingLocation(false);
            toast({
              title: "Service unavailable",
              description: "Sorry, we are not available in your city. EsyGrab currently serves Nepal only.",
              variant: "destructive",
            });
            return;
          }
          
          // Using OpenStreetMap Nominatim API for reverse geocoding (free alternative)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
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
            setDeliveryAddress(formattedLocation);
            
            // Store location data for future use
            localStorage.setItem("esygrab_user_location", JSON.stringify({
              lat: lat,
              lng: lng,
              formatted: formattedLocation,
            }));
            
            toast({
              title: "Location detected",
              description: "Your delivery address has been updated with high accuracy",
            });
          } else {
            console.log('Geocoding failed, using coordinates');
            const fallbackLocation = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            setDeliveryAddress(fallbackLocation);
            
            toast({
              title: "Location detected",
              description: "Your location has been detected. Please refine the address if needed.",
            });
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
          setDeliveryAddress(fallbackLocation);
          
          toast({
            title: "Location detected",
            description: "Your location has been detected. Please refine the address if needed.",
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectingLocation(false);
        
        // Show GPS permission popup for denied or unavailable GPS
        if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
          setShowGPSPopup(true);
        } else {
          toast({
            title: "Location timeout",
            description: "Location request timed out. Please try again or enter manually.",
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleGPSRetry = () => {
    setShowGPSPopup(false);
    detectLocation();
  };

  const handleGPSPopupClose = () => {
    setShowGPSPopup(false);
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Address required", 
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    onComplete({ fullName, deliveryAddress });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 text-sm">
          We need a few details to deliver your order
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Delivery Address *
          </Label>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Enter your delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting High-Accuracy GPS...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Auto-detect location
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
      >
        {loading ? "Saving..." : "Continue to Payment"}
      </Button>

      <GPSPermissionPopup
        isOpen={showGPSPopup}
        onClose={handleGPSPopupClose}
        onRetry={handleGPSRetry}
      />
    </div>
  );
};

export default UserDetailsForm;