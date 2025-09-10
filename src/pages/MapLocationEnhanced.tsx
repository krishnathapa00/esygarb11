import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { showToast } from "@/components/Toast";

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

const OFFICE_COORDS = { lat: 27.687441, lng: 85.340829 };
const MAX_DISTANCE_KM = 1;

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
  const [markerPosition, setMarkerPosition] = useState(OFFICE_COORDS);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(true); // new state

  // ------------------- Distance & Range -------------------
  const getDistanceFromOffice = (lat: number, lng: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat - OFFICE_COORDS.lat);
    const dLon = toRad(lng - OFFICE_COORDS.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(OFFICE_COORDS.lat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const checkDeliveryRange = (lat: number, lng: number) => {
    const distance = getDistanceFromOffice(lat, lng);
    const inRange = distance <= MAX_DISTANCE_KM;
    setIsWithinRange(inRange);

    if (!inRange) {
      showToast(
        "Sorry, we currently do not deliver to this location.",
        "error"
      );
    }

    return inRange;
  };

  // ------------------- Marker Utility -------------------
  const updateMarker = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    marker.current?.setPosition({ lat, lng });
    map.current?.panTo({ lat, lng });
  };

  const reverseGeocode = (lat: number, lng: number) => {
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

  const placeMarkerAt = (lat: number, lng: number, address?: string) => {
    checkDeliveryRange(lat, lng);
    updateMarker(lat, lng);
    if (address) setSelectedLocation(address);
    else reverseGeocode(lat, lng);
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
      window.initGoogleMaps = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || !window.google) return;

      const mapInstance = new window.google.maps.Map(mapContainer.current, {
        zoom: 15,
        center: OFFICE_COORDS,
        mapTypeControl: true,
      });

      marker.current = new window.google.maps.Marker({
        position: OFFICE_COORDS,
        map: mapInstance,
        draggable: true,
        title: "Your Location",
        animation: window.google.maps.Animation.DROP,
      });

      marker.current.addListener("dragend", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarkerAt(lat, lng);
      });

      mapInstance.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarkerAt(lat, lng);
      });

      map.current = mapInstance;
      placeMarkerAt(OFFICE_COORDS.lat, OFFICE_COORDS.lng);
    };

    loadGoogleMaps();
  }, []);

  // ------------------- Auto Detect -------------------
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
        placeMarkerAt(lat, lng);
        setIsDetecting(false);
      },
      () => {
        toast({
          title: "GPS Error",
          description: "Unable to detect location.",
          variant: "destructive",
        });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ------------------- Search Suggestions -------------------
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
        placeMarkerAt(lat, lng, description);
      }
    });

    setSuggestions([]);
    setSearchQuery(description);
  };

  const handleSearchLocation = (address: string) => {
    if (!address.trim() || !window.google || !map.current) return;

    setIsSearching(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      setIsSearching(false);
      if (status === "OK" && results && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        placeMarkerAt(lat, lng, results[0].formatted_address);
      } else {
        toast({
          title: "Location not found",
          description: "Please enter a valid address.",
          variant: "destructive",
        });
      }
    });
  };

  // ------------------- Save Location -------------------
  const handleSaveLocation = () => {
    if (!selectedLocation.trim()) {
      toast({
        title: "No location selected",
        description: "Please pick a location before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!isWithinRange) return;

    localStorage.setItem(
      "esygrab_user_location",
      JSON.stringify({ address: selectedLocation, coordinates: markerPosition })
    );

    toast({
      title: "Location saved",
      description: `${selectedLocation} has been saved successfully.`,
    });

    navigate(-1);
  };

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
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
        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm relative">
          <Label htmlFor="search">Search Location</Label>
          <div className="flex space-x-2 mt-1 relative">
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place (e.g., New Baneshwor, Kathmandu)"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchLocation(searchQuery);
                }
              }}
            />
            <Button
              onClick={() => handleSearchLocation(searchQuery)}
              disabled={!searchQuery.trim() || isSearching}
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
          <div
            ref={mapContainer}
            className="w-full h-96"
            style={{ minHeight: "400px" }}
          />
        </div>

        {/* Selected Location */}
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <Label htmlFor="location">Selected Location</Label>
            <Input
              id="location"
              value={selectedLocation}
              readOnly
              placeholder="Search your location above"
              className="mt-1"
            />
          </div>
          {!isWithinRange && (
            <p className="text-sm text-red-500">
              This location is outside our 2 km delivery range. Please move the
              marker closer to continue.
            </p>
          )}
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveLocation}
              disabled={!selectedLocation.trim() || !isWithinRange}
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
