
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import GPSPermissionPopup from './GPSPermissionPopup';

interface LocationDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (location: string) => void;
}

const LocationDetectionPopup = ({ isOpen, onClose, onLocationSet }: LocationDetectionPopupProps) => {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);
  const [showGPSPopup, setShowGPSPopup] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Location detected:', position.coords.latitude, position.coords.longitude);
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Store coordinates temporarily for map page
            localStorage.setItem('esygrab_temp_location', JSON.stringify({
              coordinates: { lat, lng },
              detected: true
            }));
            
            setIsDetecting(false);
            onClose();
            
            // Redirect to map page to show detected location
            navigate('/map-location');
          } catch (error) {
            console.error('Geocoding error:', error);
            setIsDetecting(false);
            navigate('/map-location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetecting(false);
          
          // Show GPS permission popup for denied or unavailable GPS
          if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
            setShowGPSPopup(true);
          } else {
            let errorMessage = 'Location request timed out. Please try again.';
            alert(errorMessage);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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

  const handleGPSPopupClose = () => {
    setShowGPSPopup(false);
    handleSetManually();
  };

  const handleGPSRetry = () => {
    setShowGPSPopup(false);
    detectLocation();
  };

  return (
    <>
      <Dialog open={isOpen && !showGPSPopup} onOpenChange={onClose}>
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
                To provide you with the best delivery experience, please set your location with high accuracy GPS.
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
                    Detecting High-Accuracy GPS...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Auto Detect with GPS
                  </>
                )}
              </Button>

              <Button
                onClick={handleSetManually}
                variant="outline"
                className="w-full rounded-xl"
              >
                Set Manually on Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GPSPermissionPopup
        isOpen={showGPSPopup}
        onClose={handleGPSPopupClose}
        onRetry={handleGPSRetry}
      />
    </>
  );
};

export default LocationDetectionPopup;
