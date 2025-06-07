
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (location: string) => void;
}

const LocationDetectionPopup = ({ isOpen, onClose, onLocationSet }: LocationDetectionPopupProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');

  const detectLocation = () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Location detected:', position.coords.latitude, position.coords.longitude);
            
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
              setDetectedLocation(formattedLocation);
              onLocationSet(formattedLocation);
            } else {
              console.log('Geocoding failed, using coordinates');
              const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
              setDetectedLocation(fallbackLocation);
              onLocationSet(fallbackLocation);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
            setDetectedLocation(fallbackLocation);
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

  const handleManualSubmit = () => {
    if (manualLocation.trim()) {
      onLocationSet(manualLocation);
      onClose();
    }
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
              To provide you with the best delivery experience, please allow us to detect your location or enter it manually.
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
                  Auto-Detect Location
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter your area/city manually"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="rounded-xl"
              />
              <Button
                onClick={handleManualSubmit}
                variant="outline"
                className="w-full rounded-xl"
                disabled={!manualLocation.trim()}
              >
                Set Location
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetectionPopup;
