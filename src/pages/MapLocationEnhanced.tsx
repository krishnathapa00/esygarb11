import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { DELIVERY_AREA_COORDS } from "@/data/deliveryConsts";
import { detectLocation } from "@/utils/detectUserLocation";

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

const MAP_CENTER = { lat: 27.69397, lng: 85.338207 };

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const MapLocationEnhanced = () => {
  const navigate = useNavigate();

  const { user } = useAuthContext();

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(MAP_CENTER);
  const [isWithinRange, setIsWithinRange] = useState(true);

  const deliveryPolygon = useRef<any>(null);

  useEffect(() => {
    document.body.classList.remove("with-search-bar");
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry,marker&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      window.initGoogleMaps = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || !window.google) return;

      const mapInstance = new window.google.maps.Map(mapContainer.current, {
        zoom: 14,
        center: MAP_CENTER,
        mapTypeControl: true,
      });

      // Map center marker
      marker.current = new window.google.maps.Marker({
        position: MAP_CENTER,
        map: mapInstance,
        draggable: true,
        title: "Selected Location",
        animation: window.google.maps.Animation.DROP,
      });

      // Delivery Polygon
      deliveryPolygon.current = new window.google.maps.Polygon({
        paths: DELIVERY_AREA_COORDS,
        strokeColor: "#10B981",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#10B981",
        fillOpacity: 0.1,
        map: mapInstance,
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
      placeMarkerAt(MAP_CENTER.lat, MAP_CENTER.lng);
    };

    loadGoogleMaps();
  }, []);

  const checkDeliveryRange = (lat: number, lng: number) => {
    if (
      !window.google ||
      !window.google.maps.geometry ||
      !deliveryPolygon.current
    ) {
      return false;
    }

    const point = new window.google.maps.LatLng(lat, lng);
    const isInside = window.google.maps.geometry.poly.containsLocation(
      point,
      deliveryPolygon.current
    );

    setIsWithinRange(isInside);

    if (!isInside) {
      toast({
        title: "Sorry, we currently do not deliver to this location.",
        variant: "destructive",
      });
    }

    return isInside;
  };

  // // ------------------- Auto Detect -------------------
  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    if (!map.current) {
      toast({
        title: "Map Loading",
        description: "Please wait for the map to load before detecting.",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);

    try {
      const { lat, lng } = await detectLocation();

      const isInside = checkDeliveryRange(lat, lng);

      updateMarker(lat, lng);
      reverseGeocode(lat, lng);

      if (!isInside) {
        toast({
          title: "Sorry! You're outside our delivery area.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Location Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
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
  const handleSaveLocation = async () => {
    if (!selectedLocation.trim()) {
      toast({
        title: "No location selected",
        description: "Please pick a location before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!isWithinRange) return;

    const coords = {
      lat: Number(markerPosition?.lat ?? MAP_CENTER.lat),
      lng: Number(markerPosition?.lng ?? MAP_CENTER.lng),
    };

    // Save locally
    localStorage.setItem(
      "esygrab_user_location",
      JSON.stringify({ address: selectedLocation, coordinates: coords })
    );

    // Save to Supabase profile with JSON location
    if (user) {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        location: JSON.stringify(coords),
        delivery_location: selectedLocation,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving location to Supabase:", error);
        toast({
          title: "Error",
          description: "Could not update location on server.",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Location saved",
      description: `${selectedLocation} has been saved successfully.`,
    });

    navigate(-1);
  };

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-10 md:pb-0">
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
          {/* Delivery area notice */}
          <div className="mt-4 p-4 bg-blue-50 border-t text-center text-sm text-blue-800">
            Our delivery area is limited to the region highlighted on the map.
            Thank you for your understanding.
          </div>
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
              This location is outside our delivery range. Please move the
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
