
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Crosshair, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const MapLocation = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 27.7172, lng: 85.3240 }); // Default to Kathmandu
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map and load detected location if available
  useEffect(() => {
    // Check for temporarily stored detected location first
    const tempLocation = localStorage.getItem('esygrab_temp_location');
    if (tempLocation) {
      try {
        const location = JSON.parse(tempLocation);
        if (location.detected && location.coordinates) {
          setMarkerPosition(location.coordinates);
          // Auto-reverse geocode the detected location
          reverseGeocode(location.coordinates.lat, location.coordinates.lng);
        }
        // Clear temp location after use
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
            setMarkerPosition(location.coordinates);
          }
        } catch (error) {
          console.error('Error parsing saved location:', error);
        }
      }
    }
    
    setMapLoaded(true);
  }, []);

  // Helper function for reverse geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
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
        
        setSelectedLocation(formattedLocation);
      } else {
        setSelectedLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
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
          await reverseGeocode(lat, lng);
          setIsDetecting(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetecting(false);
          
          if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
            alert('Please turn on GPS and allow location access for accurate delivery.');
          } else {
            alert('Location request timed out. Please try again or set location manually.');
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

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          setMarkerPosition({ lat, lng });
          setSelectedLocation(result.display_name);
          
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

  // Service availability check
  const checkServiceAvailability = (lat: number, lng: number) => {
    // Nepal approximate bounds: lat 26-31, lng 80-89
    const isInNepal = lat >= 26 && lat <= 31 && lng >= 80 && lng <= 89;
    return isInNepal;
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
        navigate('/'); // Go to homepage
      } else {
        toast({
          title: "Service unavailable",
          description: "Sorry, we are not available at your location. EsyGrab currently serves Nepal only.",
          variant: "destructive",
        });
        navigate('/'); // Still navigate to homepage but with unavailable message
      }
    } else {
      toast({
        title: "No location selected",
        description: "Please select a location first",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to coordinates (wider area around Kathmandu)
    const lat = 27.7172 + (0.5 - y / rect.height) * 0.02; // Wider latitude range
    const lng = 85.3240 + (x / rect.width - 0.5) * 0.03; // Wider longitude range
    
    setMarkerPosition({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="mr-3">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
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
          {/* Map Area */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div 
              ref={mapRef}
              onClick={handleMapClick}
              className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 cursor-crosshair"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            >
              {mapLoaded && (
                <>
                  {/* Map placeholder content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Click anywhere on the map to set location</p>
                      <p className="text-xs">This is a demo map - click to place marker</p>
                    </div>
                  </div>
                  
                  {/* Location marker */}
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
                </>
              )}
            </div>
          </div>

          {/* Search Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Search Location</Label>
                <div className="flex space-x-2 mt-1">
                  <Input 
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a place (e.g., Thamel, Kathmandu)"
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
                <Link to="/cart" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How to set your location:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click "Auto Detect" to automatically find your current location</li>
              <li>• Click anywhere on the map to manually place a location marker</li>
              <li>• Type your address directly in the text field</li>
              <li>• Click "Save Location" when you're ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocation;
