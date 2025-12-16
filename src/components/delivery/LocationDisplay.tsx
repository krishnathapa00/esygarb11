import React, { useState, useEffect } from "react";

interface LocationDisplayProps {
  address: string;
  fallback?: string;
  className?: string;
  truncate?: boolean;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  address,
  fallback = "Location not available",
  className = "",
  truncate = true,
}) => {
  const [locationName, setLocationName] = useState(address);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const formatLocationName = async (addr: string) => {
      if (!addr || addr.trim() === "") {
        setLocationName(fallback);
        return;
      }

      // Check if it's coordinates (lat,lng format)
      const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
      if (coordPattern.test(addr.trim())) {
        setIsLoading(true);
        try {
          // Reverse geocode to get readable address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${addr}.json?access_token=${
              process.env.VITE_MAPBOX_TOKEN ||
              "pk.eyJ1IjoidGVzdHVzZXIxMjM0IiwiYSI6ImNsc3l5bjg1YzBibHAyanFtcjV5d3Q4ZnkifQ.0aDn7U_8_lW7rJpe6XnOZA"
            }`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const place = data.features[0];
              // Extract a short, meaningful name
              const placeName = place.place_name;
              const parts = placeName.split(",");
              if (parts.length > 0) {
                let shortName = parts[0].trim();
                if (parts.length > 1 && shortName.length < 10) {
                  shortName += ", " + parts[1].trim();
                }
                if (shortName.length > 25) {
                  shortName = shortName.substring(0, 22) + "...";
                }
                setLocationName(shortName);
              } else {
                setLocationName(
                  placeName.length > 25
                    ? placeName.substring(0, 22) + "..."
                    : placeName
                );
              }
            } else {
              setLocationName(addr);
            }
          } else {
            setLocationName(addr);
          }
        } catch (error) {
          console.error("Error formatting location:", error);
          setLocationName(addr);
        } finally {
          setIsLoading(false);
        }
      } else {
        if (truncate) {
          const shortAddr =
            addr.length > 25 ? addr.split(",")[0].trim() + "..." : addr;
          setLocationName(shortAddr);
        } else {
          setLocationName(addr);
        }
      }
    };

    formatLocationName(address);
  }, [address, fallback]);

  if (isLoading) {
    return <span className={className}>Loading location...</span>;
  }

  return <span className={className}>{locationName}</span>;
};

export default LocationDisplay;
