import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, User } from "lucide-react";

interface UserDetailsFormProps {
  email: string;
  onComplete: (details: { fullName: string; deliveryAddress: string }) => void;
  loading?: boolean;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  email,
  onComplete,
  loading = false,
}) => {
  const [fullName, setFullName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { toast } = useToast();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      });
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=1234567890abcdef&limit=1`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted;
            setDeliveryAddress(address);
            localStorage.setItem("esygrab_user_location", JSON.stringify({
              lat: latitude,
              lng: longitude,
              formatted: address,
            }));
            toast({
              title: "Location detected",
              description: "Your delivery address has been updated",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not get your location. Please enter manually.",
            variant: "destructive",
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast({
          title: "Location access denied",
          description: "Please enter your delivery address manually",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Address required", 
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    onComplete({ fullName, deliveryAddress });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 text-sm">
          We need a few details to deliver your order
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Delivery Address *
          </Label>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Enter your delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full"
            >
              {detectingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Detecting location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Auto-detect location
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
      >
        {loading ? "Saving..." : "Continue to Payment"}
      </Button>
    </div>
  );
};

export default UserDetailsForm;