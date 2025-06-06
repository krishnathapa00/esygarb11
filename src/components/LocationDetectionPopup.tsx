
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
            // Using a reverse geocoding service (you can replace with your preferred service)
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
            );
            
            if (response.ok) {
              const data = await response.json();
              const location = data.results[0]?.formatted || 'Location detected';
              setDetectedLocation(location);
              onLocationSet(location);
            } else {
              // Fallback to a generic location
              const fallbackLocation = 'Current Location Detected';
              setDetectedLocation(fallbackLocation);
              onLocationSet(fallbackLocation);
            }
          } catch (error) {
            console.log('Using fallback location detection');
            const fallbackLocation = 'Current Location Detected';
            setDetectedLocation(fallbackLocation);
            onLocationSet(fallbackLocation);
          }
          setIsDetecting(false);
          onClose();
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetecting(false);
          // Don't close popup, let user enter manually
        }
      );
    } else {
      setIsDetecting(false);
      console.log('Geolocation not supported');
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
