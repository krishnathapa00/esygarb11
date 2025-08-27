import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GoogleMapsComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  showControls?: boolean;
  height?: string;
  apiKey?: string;
}

// Declare global google types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g';

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({ 
  onLocationSelect, 
  initialLocation = { lat: 27.7172, lng: 85.3240 }, // Default to Kathmandu
  showControls = true,
  height = "400px",
  apiKey = GOOGLE_MAPS_API_KEY
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      setIsLoaded(true);
      initMap();
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: selectedLocation,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
    });

    // Add marker
    const markerInstance = new window.google.maps.Marker({
      position: selectedLocation,
      map: mapInstance,
      draggable: true,
      title: 'Selected Location'
    });

    // Handle map click
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateLocation(lat, lng, markerInstance, mapInstance);
    });

    // Handle marker drag
    markerInstance.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateLocation(lat, lng, markerInstance, mapInstance);
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Initial reverse geocoding
    reverseGeocode(selectedLocation.lat, selectedLocation.lng);
  };

  const updateLocation = (lat: number, lng: number, markerInstance: any, mapInstance: any) => {
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    
    markerInstance.setPosition(newLocation);
    mapInstance.panTo(newLocation);
    
    reverseGeocode(lat, lng);
    
    if (onLocationSelect) {
      reverseGeocode(lat, lng).then(address => {
        onLocationSelect({ lat, lng, address });
      });
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject('No address found');
          }
        });
      });
      setAddress(response as string);
      return response as string;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      return fallbackAddress;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateLocation(lat, lng, marker, map);
        setIsDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetecting(false);
        toast({
          title: "Location access denied",
          description: "Please allow location access for accurate positioning",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || !window.google) return;

    setIsSearching(true);
    try {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        query: searchQuery,
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
      };

      service.textSearch(request, (results: any, status: any) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0];
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          updateLocation(lat, lng, marker, map);
          toast({
            title: "Location found",
            description: "Location updated on the map",
          });
        } else {
          toast({
            title: "Location not found",
            description: "Please try a different search term",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      setIsSearching(false);
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search location. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      {showControls && (
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Select Location
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {!isLoaded ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading map...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {showControls && (
              <>
                <div className="flex space-x-2">
                  <Button onClick={getCurrentLocation} variant="outline" size="sm" disabled={isDetecting}>
                    {isDetecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    {isDetecting ? 'Detecting...' : 'Use Current Location'}
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    className="flex-1"
                  />
                  <Button
                    onClick={searchLocation}
                    disabled={isSearching || !searchQuery.trim()}
                    size="sm"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            )}
            
            <div 
              ref={mapRef} 
              className="w-full rounded-lg"
              style={{ height }}
            />
            
            {showControls && address && (
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

export default GoogleMapsComponent;