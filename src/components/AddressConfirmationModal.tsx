import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Edit, X } from 'lucide-react';

interface AddressConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeAddress: () => void;
  address: string;
}

const AddressConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onChangeAddress, 
  address 
}: AddressConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Confirm Delivery Address</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery Address</p>
              <p className="text-sm text-gray-600 mt-1">{address || 'No address selected'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            disabled={!address}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Confirm Address
          </Button>
          <Button
            onClick={onChangeAddress}
            variant="outline"
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Change Address
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddressConfirmationModal;