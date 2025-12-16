import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle } from 'lucide-react';

interface GPSPermissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const GPSPermissionPopup = ({ isOpen, onClose, onRetry }: GPSPermissionPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-red-600">
            GPS Permission Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              Please turn on GPS and allow location access for accurate delivery.
            </p>
            <p className="text-sm text-gray-500">
              We need your precise location to ensure your orders reach you quickly and accurately.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">How to enable GPS:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Turn on location/GPS in your device settings</li>
                <li>2. Refresh this page or click "Try Again"</li>
                <li>3. Allow location access when prompted</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full rounded-xl"
            >
              Set Location Manually
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GPSPermissionPopup;