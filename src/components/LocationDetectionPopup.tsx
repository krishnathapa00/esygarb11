
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (location: string) => void;
}

const LocationDetectionPopup = ({ isOpen, onClose, onLocationSet }: LocationDetectionPopupProps) => {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Location detected:', position.coords.latitude, position.coords.longitude);
            
            // Check if user is within Nepal coordinates (rough bounds)
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Nepal approximate bounds: lat 26-31, lng 80-89
            const isInNepal = lat >= 26 && lat <= 31 && lng >= 80 && lng <= 89;
            
            if (!isInNepal) {
              setIsDetecting(false);
              alert('Sorry, we are not available in your city. EsyGrab currently serves Nepal only.');
              onClose();
              return;
            }
            
            // Using OpenStreetMap Nominatim API for reverse geocoding (free alternative)
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
              onLocationSet(formattedLocation);
            } else {
              console.log('Geocoding failed, using coordinates');
              const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
              onLocationSet(fallbackLocation);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
            onLocationSet(fallbackLocation);
          }
          setIsDetecting(false);
          onClose();
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
    onClose();
    navigate('/map-location');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Welcome to EsyGrab!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600">
              To provide you with the best delivery experience, please set your location.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={detectLocation}
              disabled={isDetecting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting Location...
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
              className="w-full rounded-xl"
            >
              Set Manually
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetectionPopup;
