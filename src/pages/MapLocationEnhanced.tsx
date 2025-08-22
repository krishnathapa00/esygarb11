import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Crosshair, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia3Jpc2huYTEyNDMzNCIsImEiOiJjbWVodG1mZjcwMjhwMnJxczZ1ZWQyeTNlIn0.pl7sk2526OEU-Ub-hB0QTQ';

const MapLocationEnhanced = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 27.7172, lng: 85.3240 }); // Default to Kathmandu
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supported = !!gl;
      console.log('WebGL Support Check:', supported);
      return supported;
    } catch (e) {
      console.error('WebGL Support Error:', e);
      return false;
    }
  };

  // Initialize map with error handling
  useEffect(() => {
    console.log('Map initialization starting...');
    if (!mapContainer.current) {
      console.log('Map container not found');
      return;
    }

    // Check WebGL support first
    const webglSupport = checkWebGLSupport();
    console.log('WebGL Support Result:', webglSupport);
    
    if (!webglSupport) {
      console.log('WebGL not supported, showing fallback');
      setWebglSupported(false);
      setMapError('WebGL is not supported in your browser. Please use a modern browser that supports WebGL.');
      return;
    }

    try {
      console.log('Setting Mapbox token...');
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      console.log('Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [markerPosition.lng, markerPosition.lat],
        zoom: 15,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false
      });

      console.log('Map instance created, adding controls...');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker
      console.log('Adding marker...');
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#ef4444'
      })
      .setLngLat([markerPosition.lng, markerPosition.lat])
      .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          setMarkerPosition({ lat: lngLat.lat, lng: lngLat.lng });
          reverseGeocode(lngLat.lat, lngLat.lng);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setMarkerPosition({ lat, lng });
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        reverseGeocode(lat, lng);
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e.error);
        setMapError('Failed to load the map. Please refresh the page and try again.');
        setWebglSupported(false);
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully!');
        setMapLoaded(true);
        setMapError(null);
        
        // Check for temporarily stored detected location
        const tempLocation = localStorage.getItem('esygrab_temp_location');
        if (tempLocation) {
          try {
            const location = JSON.parse(tempLocation);
            if (location.detected && location.coordinates) {
              const { lat, lng } = location.coordinates;
              setMarkerPosition({ lat, lng });
              if (map.current && marker.current) {
                map.current.setCenter([lng, lat]);
                marker.current.setLngLat([lng, lat]);
              }
              reverseGeocode(lat, lng);
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
                setMarkerPosition({ lat, lng });
                if (map.current && marker.current) {
                  map.current.setCenter([lng, lat]);
                  marker.current.setLngLat([lng, lat]);
                }
              }
            } catch (error) {
              console.error('Error parsing saved location:', error);
            }
          }
        }
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(`Failed to initialize the map: ${error.message}`);
      setWebglSupported(false);
    }

    return () => {
      try {
        if (map.current) {
          console.log('Cleaning up map...');
          map.current.remove();
        }
      } catch (error) {
        console.error('Error cleaning up map:', error);
      }
    };
  }, []);

  // Helper function for reverse geocoding using Mapbox
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          setSelectedLocation(place.place_name);
        } else {
          setSelectedLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        }
      } else {
        setSelectedLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
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
            map.current.setCenter([lng, lat]);
            marker.current.setLngLat([lng, lat]);
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
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&country=NP&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          const [lng, lat] = place.center;
          
          setMarkerPosition({ lat, lng });
          setSelectedLocation(place.place_name);
          
          if (map.current && marker.current) {
            map.current.setCenter([lng, lat]);
            marker.current.setLngLat([lng, lat]);
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
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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
            {mapError || !webglSupported ? (
              // Fallback UI when WebGL is not supported or map fails
              <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                <MapPin className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
                  {mapError || 'Your browser does not support WebGL, which is required for the interactive map.'}
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