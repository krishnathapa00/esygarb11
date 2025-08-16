import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

const ServiceUnavailableMessage = () => {
  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <MapPin className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-700">
        Sorry, we are not available at your location. EsyGrab currently serves Nepal only.
      </AlertDescription>
    </Alert>
  );
};

export default ServiceUnavailableMessage;