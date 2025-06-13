
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';

interface GoogleMapsProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

// Declare global google types
declare global {
  interface Window {
    google: any;
  }
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [apiKeyEntered, setApiKeyEntered] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // For demo purposes - in production, this should come from environment variables
  const loadGoogleMapsScript = (key: string) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default to Kathmandu, Nepal
    const defaultLocation = { lat: 27.7172, lng: 85.3240 };
    
    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultLocation,
    });

    // Add click listener to map
    newMap.addListener('click', (event: any) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        
        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const formattedAddress = results[0].formatted_address;
            setAddress(formattedAddress);
            onLocationSelect({ lat, lng, address: formattedAddress });
          }
        });

        // Add marker
        new window.google.maps.Marker({
          position: { lat, lng },
          map: newMap,
          title: 'Selected Location'
        });
      }
    });

    setMap(newMap);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLocation({ lat, lng });
          
          if (map && window.google) {
            map.setCenter({ lat, lng });
            new window.google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: 'Your Location'
            });

            // Reverse geocoding
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === 'OK' && results && results[0]) {
                const formattedAddress = results[0].formatted_address;
                setAddress(formattedAddress);
                onLocationSelect({ lat, lng, address: formattedAddress });
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually on the map.');
        }
      );
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setApiKeyEntered(true);
      loadGoogleMapsScript(apiKey);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Select Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!apiKeyEntered ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your Google Maps API key to use location services:
            </p>
            <Input
              type="text"
              placeholder="Google Maps API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleApiKeySubmit} className="w-full">
              Load Maps
            </Button>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={getCurrentLocation} variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
            
            <div 
              ref={mapRef} 
              className="w-full h-64 bg-gray-200 rounded-lg"
            />
            
            {address && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Selected Address:</p>
                <p className="text-sm text-gray-600">{address}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMaps;
