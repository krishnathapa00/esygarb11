import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Crosshair, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

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

  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({
    lat: 27.7172,
    lng: 85.324,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        setMarkerPosition({ lat, lng });
        map.current?.panTo({ lat, lng });

        if (marker.current) {
          if (marker.current.setPosition)
            marker.current.setPosition({ lat, lng });
          else marker.current.position = { lat, lng }; // AdvancedMarkerElement
        }

        reverseGeocode(lat, lng);

        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "GPS Error",
          description: "Unable to detect location. Please try again.",
          variant: "destructive",
        });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ------------------- Load Map -------------------
  useEffect(() => {
    if (!mapContainer.current) return;

    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=initGoogleMaps`;
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

        // ---------- Custom Green Pin ----------
        let markerInstance;
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          const pinElement = document.createElement("div");
          pinElement.style.width = "32px";
          pinElement.style.height = "32px";
          pinElement.style.background = "#10b981";
          pinElement.style.borderRadius = "50% 50% 50% 0";
          pinElement.style.transform = "rotate(-45deg)";
          pinElement.style.position = "relative";
          pinElement.style.top = "-16px";
          pinElement.style.left = "-16px";
          pinElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

          const innerCircle = document.createElement("div");
          innerCircle.style.width = "14px";
          innerCircle.style.height = "14px";
          innerCircle.style.background = "white";
          innerCircle.style.borderRadius = "50%";
          innerCircle.style.position = "absolute";
          innerCircle.style.top = "9px";
          innerCircle.style.left = "9px";

          pinElement.appendChild(innerCircle);

          markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
            position: markerPosition,
            map: mapInstance,
            gmpDraggable: true,
            content: pinElement,
          });

          markerInstance.addListener("dragend", (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng);
          });
        } else {
          // Fallback to default red marker
          markerInstance = new window.google.maps.Marker({
            position: markerPosition,
            map: mapInstance,
            draggable: true,
          });

          markerInstance.addListener("dragend", (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng);
          });
        }

        map.current = mapInstance;
        marker.current = markerInstance;
        setMapLoaded(true);
        setMapError(null);

        reverseGeocode(markerPosition.lat, markerPosition.lng);
      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError(`Failed to initialize the map: ${error}`);
      }
    };

    loadGoogleMaps();
  }, []);

  // ------------------- Suggestions -------------------
  useEffect(() => {
    if (!searchQuery.trim() || !window.google) {
      setSuggestions([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: searchQuery, componentRestrictions: { country: "np" } },
      (predictions: any, status: any) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [searchQuery]);

  // ------------------- Handle Suggestion Click -------------------
  const handleSuggestionClick = (placeId: string, description: string) => {
    if (!window.google || !map.current) return;

    const service = new window.google.maps.places.PlacesService(map.current);
    service.getDetails({ placeId }, (place: any, status: any) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        place.geometry
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarkerPosition({ lat, lng });
        setSelectedLocation(description);

        map.current.panTo({ lat, lng });

        if (marker.current) {
          if (marker.current.setPosition)
            marker.current.setPosition({ lat, lng });
          else marker.current.position = { lat, lng }; // AdvancedMarkerElement
        }
      }
    });

    setSuggestions([]);
    setSearchQuery(description);
  };

  // ------------------- Reverse Geocode -------------------
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          setSelectedLocation(results[0].formatted_address);
        } else {
          setSelectedLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      }
    );
  };

  // ------------------- Save Location -------------------
  const handleSaveLocation = () => {
    if (!selectedLocation.trim()) {
      toast({
        title: "No location selected",
        description: "Please search or pick a location before saving.",
        variant: "destructive",
      });
      return;
    }

    const savedData = {
      address: selectedLocation,
      coordinates: markerPosition,
    };

    localStorage.setItem("esygrab_user_location", JSON.stringify(savedData));

    toast({
      title: "Location saved",
      description: `${savedData.address} has been saved successfully.`,
    });

    console.log("Saved Location:", savedData);

    navigate(-1);
  };

  // ------------------- Search Location -------------------
  const handleSearchLocation = async () => {
    if (!searchQuery.trim() || !window.google || !map.current) return;

    setIsSearching(true);
    const service = new window.google.maps.places.PlacesService(map.current);
    service.textSearch(
      {
        query: searchQuery,
        fields: ["place_id", "geometry", "formatted_address", "name"],
      },
      (results: any, status: any) => {
        setIsSearching(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results[0]
        ) {
          const place = results[0];
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          setMarkerPosition({ lat, lng });
          setSelectedLocation(place.formatted_address);

          map.current.panTo({ lat, lng });
          if (marker.current) {
            if (marker.current.setPosition)
              marker.current.setPosition({ lat, lng });
            else marker.current.position = { lat, lng };
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
    );
  };

  // ------------------- JSX -------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-3"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                Select Location
              </h1>
            </div>
            <Button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Detecting...
                </>
              ) : (
                <>
                  <Crosshair className="h-4 w-4 mr-2" /> Auto Detect
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search Location */}
        <div className="bg-white rounded-lg p-4 shadow-sm relative">
          <Label htmlFor="search">Search Location</Label>
          <div className="flex space-x-2 mt-1 relative">
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place (e.g., New Baneshwor, Kathmandu)"
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSearchLocation()}
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

          {suggestions.length > 0 && (
            <div className="absolute z-10 bg-white border rounded w-full mt-1 shadow max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <div
                  key={s.place_id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() =>
                    handleSuggestionClick(s.place_id, s.description)
                  }
                >
                  {s.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {mapError ? (
            <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
              <MapPin className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Map Unavailable
              </h3>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="w-full h-96"
              style={{ minHeight: "400px" }}
            />
          )}
        </div>

        {/* Selected Location */}
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
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
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationEnhanced;
