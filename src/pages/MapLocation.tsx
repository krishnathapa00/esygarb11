
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MapLocation = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map (using a simple implementation without external map library)
  useEffect(() => {
    // Load user's saved location if available
    const savedLocation = localStorage.getItem('esygrab_user_location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setSelectedLocation(location.address || '');
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
    setMapLoaded(true);
  }, []);

  const handleAutoDetect = () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Location detected:', position.coords.latitude, position.coords.longitude);
            
            setMarkerPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });

            // Using OpenStreetMap Nominatim API for reverse geocoding
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
              setSelectedLocation(formattedLocation);
            } else {
              console.log('Geocoding failed, using coordinates');
              const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
              setSelectedLocation(fallbackLocation);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            const fallbackLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
            setSelectedLocation(fallbackLocation);
          }
          setIsDetecting(false);
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

  const handleSaveLocation = () => {
    if (selectedLocation.trim()) {
      localStorage.setItem('esygrab_user_location', JSON.stringify({
        address: selectedLocation,
        coordinates: markerPosition
      }));
      alert('Location saved successfully!');
      navigate(-1); // Go back to previous page
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple calculation for demo purposes
    const lat = markerPosition.lat + (y - rect.height / 2) * 0.0001;
    const lng = markerPosition.lng + (x - rect.width / 2) * 0.0001;
    
    setMarkerPosition({ lat, lng });
    setSelectedLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
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

          {/* Location Input */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Selected Location</Label>
                <Input 
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Enter your address or click on the map"
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
