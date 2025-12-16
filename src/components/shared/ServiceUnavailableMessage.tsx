import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

const ServiceUnavailableMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Service Not Available
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            We're not available in your location yet. We currently deliver within 3km of our service area.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-left">
                <p className="text-amber-800 font-medium text-sm">Coming Soon</p>
                <p className="text-amber-700 text-sm mt-1">
                  We're expanding our delivery network. Check back soon or update your location.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.removeItem('esygrab_user_location');
                window.location.reload();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Change Location
            </button>
            
            <p className="text-xs text-gray-500">
              Select a location within our service area to start shopping
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailableMessage;