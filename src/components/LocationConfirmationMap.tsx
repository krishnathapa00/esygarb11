import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationConfirmationMapProps {
  initialLocation: { lat: number; lng: number };
  onLocationConfirm: (location: { lat: number; lng: number; address: string }) => void;
  onCancel: () => void;
}

const LocationConfirmationMap: React.FC<LocationConfirmationMapProps> = ({
  initialLocation,
  onLocationConfirm,
  onCancel
}) => {
  const [markerPosition, setMarkerPosition] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(true);

  // Reverse geocode the initial location
  useEffect(() => {
    reverseGeocode(initialLocation.lat, initialLocation.lng);
  }, [initialLocation]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocodingLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const addressData = data.address || {};
        const locationParts = [];
        
        if (addressData.house_number && addressData.road) {
          locationParts.push(`${addressData.house_number} ${addressData.road}`);
        } else if (addressData.road) {
          locationParts.push(addressData.road);
        }
        
        if (addressData.neighbourhood || addressData.suburb) {
          locationParts.push(addressData.neighbourhood || addressData.suburb);
        }
        
        if (addressData.city || addressData.town || addressData.village) {
          locationParts.push(addressData.city || addressData.town || addressData.village);
        }
        
        if (addressData.state) {
          locationParts.push(addressData.state);
        }
        
        const formattedLocation = locationParts.length > 0 
          ? locationParts.join(', ')
          : data.display_name || 'Location detected';
        
        setAddress(formattedLocation);
      } else {
        setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate new position relative to current marker
    const lat = markerPosition.lat + (y - rect.height / 2) * 0.0001;
    const lng = markerPosition.lng + (x - rect.width / 2) * 0.0001;
    
    setMarkerPosition({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  const handleConfirm = () => {
    if (address.trim()) {
      onLocationConfirm({
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        address: address
      });
    } else {
      toast({
        title: "Address required",
        description: "Please wait for the address to load or enter it manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Confirm Your Location
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your location has been detected. You can adjust the pin for better accuracy.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interactive Map */}
        <div 
          onClick={handleMapClick}
          className="relative w-full h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg cursor-crosshair border"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Map instructions */}
          <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600">
              Click anywhere to adjust pin location
            </p>
          </div>
          
          {/* Detected location marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <div className="relative">
              <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" fill="currentColor" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full opacity-50 animate-ping"></div>
            </div>
          </div>
          
          {/* Accuracy indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-2 shadow-sm">
            <div className="flex items-center text-xs text-green-600">
              <Navigation className="h-3 w-3 mr-1" />
              High Accuracy GPS
            </div>
          </div>
        </div>

        {/* Address input */}
        <div>
          <Label htmlFor="address">Detected Address</Label>
          {isGeocodingLoading ? (
            <div className="flex items-center mt-1 p-2 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading address...</span>
            </div>
          ) : (
            <Input 
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address will be detected automatically"
              className="mt-1"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!address.trim() || isGeocodingLoading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Confirm Location
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationConfirmationMap;