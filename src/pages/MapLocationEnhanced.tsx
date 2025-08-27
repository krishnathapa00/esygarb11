import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Crosshair, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
const GOOGLE_MAPS_API_KEY = 'AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g';

// Declare global google types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const MapLocationEnhanced = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 27.7172, lng: 85.3240 }); // Default to Kathmandu
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Load Google Maps Script and initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMaps = () => {
        initMap();
      };
      
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || !window.google) return;

      try {
        const mapInstance = new window.google.maps.Map(mapContainer.current, {
          zoom: 15,
          center: markerPosition,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        });

        // Add marker
        const markerInstance = new window.google.maps.Marker({
          position: markerPosition,
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

        map.current = mapInstance;
        marker.current = markerInstance;
        setMapLoaded(true);
        setMapError(null);

        // Check for temporarily stored detected location
        const tempLocation = localStorage.getItem('esygrab_temp_location');
        if (tempLocation) {
          try {
            const location = JSON.parse(tempLocation);
            if (location.detected && location.coordinates) {
              const { lat, lng } = location.coordinates;
              updateLocation(lat, lng, markerInstance, mapInstance);
            }
            localStorage.removeItem('esygrab_temp_location');
          } catch (error) {
            console.error('Error parsing temp location:', error);
          }
        } else {
          // Load user's saved location if available
          const savedLocation = localStorage.getItem('esygrab_user_location');
          if (savedLocation) {
            try {
              const location = JSON.parse(savedLocation);
              setSelectedLocation(location.address || '');
              if (location.coordinates) {
                const { lat, lng } = location.coordinates;
                updateLocation(lat, lng, markerInstance, mapInstance);
              }
            } catch (error) {
              console.error('Error parsing saved location:', error);
            }
          }
        }

        // Initial reverse geocoding
        reverseGeocode(markerPosition.lat, markerPosition.lng);

      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError(`Failed to initialize the map: ${error}`);
      }
    };

    const updateLocation = (lat: number, lng: number, markerInstance: any, mapInstance: any) => {
      const newLocation = { lat, lng };
      setMarkerPosition(newLocation);
      
      markerInstance.setPosition(newLocation);
      mapInstance.panTo(newLocation);
      
      reverseGeocode(lat, lng);
    };

    loadGoogleMaps();

    return () => {
      if (map.current) {
        // Google Maps doesn't need explicit cleanup like Mapbox
        map.current = null;
      }
    };
  }, []);

  // Helper function for reverse geocoding using Google Maps
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (!window.google) return;
      
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
      setSelectedLocation(response as string);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMarkerPosition({ lat, lng });
          
          if (map.current && marker.current) {
            map.current.panTo({ lat, lng });
            marker.current.setPosition({ lat, lng });
          }
          
          await reverseGeocode(lat, lng);
          setIsDetecting(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetecting(false);
          
          if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
            toast({
              title: "Location Access Denied",
              description: "Please turn on GPS and allow location access for accurate delivery.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Location Request Failed",
              description: "Location request timed out. Please try again or set location manually.",
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
    } else {
      setIsDetecting(false);
      toast({
        title: "Geolocation Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim() || !window.google || !map.current) return;
    
    setIsSearching(true);
    try {
      const service = new window.google.maps.places.PlacesService(map.current);
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
          
          setMarkerPosition({ lat, lng });
          setSelectedLocation(place.formatted_address);
          
          if (map.current && marker.current) {
            map.current.panTo({ lat, lng });
            marker.current.setPosition({ lat, lng });
          }
          
          toast({
            title: "Location found",
            description: "Location has been updated on the map",
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

  // Service availability check with 3km limit from office location
  const checkServiceAvailability = (lat: number, lng: number) => {
    // Office location: 27.687529,85.340859
    const officeLocation = { lat: 27.687529, lng: 85.340859 };
    
    // Calculate distance from office location
    const R = 6371; // Earth's radius in km
    const dLat = (lat - officeLocation.lat) * Math.PI / 180;
    const dLng = (lng - officeLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(officeLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= 3; // 3km radius limit from office
  };

  const handleSaveLocation = () => {
    if (selectedLocation.trim()) {
      const isServiceAvailable = checkServiceAvailability(markerPosition.lat, markerPosition.lng);
      
      localStorage.setItem('esygrab_user_location', JSON.stringify({
        address: selectedLocation,
        coordinates: markerPosition,
        serviceAvailable: isServiceAvailable
      }));
      
      if (isServiceAvailable) {
        toast({
          title: "Location saved",
          description: "Your delivery location has been saved successfully",
        });
        navigate(-1); // Go back to previous page
      } else {
        toast({
          title: "Service unavailable",
          description: "Sorry, we don't deliver to locations more than 3km from our service centers.",
          variant: "destructive",
        });
        navigate(-1); // Still navigate back
      }
    } else {
      toast({
        title: "No location selected",
        description: "Please select a location first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-3" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Select Location</h1>
            </div>
            <Button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Crosshair className="h-4 w-4 mr-2" />
                  Auto Detect
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Search Location - Moved to Top */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Search Location</Label>
                <div className="flex space-x-2 mt-1">
                  <Input 
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a place (e.g., New Baneshwor, Kathmandu)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                  />
                  <Button
                    onClick={handleSearchLocation}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {mapError ? (
              // Fallback UI when map fails
              <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                <MapPin className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
                  {mapError}
                </p>
                <div className="text-xs text-gray-400 text-center">
                  <p>You can still search for locations and enter addresses manually above.</p>
                  <p>Current coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}</p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapContainer}
                className="w-full h-96"
                style={{ minHeight: '400px' }}
              />
            )}
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Selected Location</Label>
                <Input 
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Enter your address or search above"
                  className="mt-1"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveLocation}
                  disabled={!selectedLocation.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Save Location
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How to set your location:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click "Auto Detect" to automatically find your current location</li>
              <li>• Search for your area in the search box above the map</li>
              <li>• Click anywhere on the map to place a location marker</li>
              <li>• Drag the red marker to adjust your exact location</li>
              <li>• Click "Save Location" when you're ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationEnhanced;