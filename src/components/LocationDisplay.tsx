import React, { useState, useEffect } from 'react';
import { formatLocationName } from '@/utils/geocoding';

interface LocationDisplayProps {
  address: string;
  fallback?: string;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ 
  address, 
  fallback = 'Location not available',
  className = ''
}) => {
  const [locationName, setLocationName] = useState(address);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocationName = async () => {
      if (!address || address.trim() === '') {
        setLocationName(fallback);
        return;
      }

      setIsLoading(true);
      try {
        const formattedName = await formatLocationName(address);
        setLocationName(formattedName);
      } catch (error) {
        console.error('Error formatting location:', error);
        setLocationName(address); // Fallback to original address
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationName();
  }, [address, fallback]);

  if (isLoading) {
    return <span className={className}>Loading location...</span>;
  }

  return <span className={className}>{locationName}</span>;
};

export default LocationDisplay;