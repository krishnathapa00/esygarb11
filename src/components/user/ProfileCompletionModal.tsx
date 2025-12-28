import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: (updated: boolean) => void;
  defaultAddress?: string;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  defaultAddress,
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [address, setAddress] = useState(defaultAddress || "");

  useEffect(() => {
    if (defaultAddress) {
      setAddress(defaultAddress);
    }
  }, [defaultAddress]);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: user?.email || "",
    address: "",
  });

  const [originalData, setOriginalData] = useState({
    full_name: "",
    phone: "",
    email: user?.email || "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      let addressFromStorage = "";
      const savedLocation = localStorage.getItem("esygrab_user_location");
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          addressFromStorage = locationData.address || "";
        } catch (e) {
          console.error(e);
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, delivery_location")
        .eq("id", user.id)
        .single();

      const profileData = {
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        email: user.email || "",
        address:
          profile?.delivery_location ||
          addressFromStorage ||
          defaultAddress ||
          "",
      };

      setFormData(profileData);
      setOriginalData(profileData);
      setIsNewUser(
        !profile?.full_name || !profile?.phone || !profile.delivery_location
      );
    };

    loadProfile();
  }, [user, defaultAddress]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(formData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        originalData[key as keyof typeof originalData]
    );
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const fullName = formData.full_name.trim();
    const phone = formData.phone.trim();

    if (isNewUser && (!fullName || !phone)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your full name and contact number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // upsert profile
      const savedLocation = localStorage.getItem("esygrab_user_location");
      let addressFromStorage = formData.address.trim();
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          if (locationData.address) {
            addressFromStorage = locationData.address;
          }
        } catch (e) {
          console.error(e);
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      const savedLocationStr = localStorage.getItem("esygrab_user_location");
      let addressFromStorageStr = formData.address.trim();
      if (savedLocationStr) {
        try {
          const locationData = JSON.parse(savedLocationStr);
          if (locationData.address) {
            addressFromStorageStr = locationData.address;
          }
        } catch (e) {
          console.error(e);
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

      // close modal
      onClose(true);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutChanges = () => {
    onClose(false);
  };

  const getButtonText = () => {
    if (loading) return "Saving...";
    if (isNewUser) return "Save & Continue";
    if (hasChanges) return "Save & Continue";
    return "Continue";
  };

  const showSaveButton = isNewUser || hasChanges;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => onClose(false)}>
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Complete Your Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              readOnly
              className="bg-gray-50 text-gray-500"
              required={isNewUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              readOnly
              className="bg-gray-50 text-gray-500"
              placeholder="Enter your contact number"
              required={isNewUser}
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Delivery Address
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = "/map-location";
                }}
                className="ml-auto text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                {formData.address ? "Change" : "Select"}
              </Button>
            </Label>
            <Input
              id="address"
              value={formData.address || ""}
              placeholder={
                formData.address
                  ? ""
                  : "Click on Select to choose your delivery address"
              }
              className="min-h-[60px]"
              readOnly
            />
            {!formData.address && (
              <p className="text-red-500 text-xs mt-1">
                Please select your delivery address
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {!isNewUser && !hasChanges && (
            <Button
              onClick={handleContinueWithoutChanges}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          )}

          {showSaveButton && (
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                (isNewUser &&
                  (!formData.full_name.trim() || !formData.phone.trim()))
              }
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {getButtonText()}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
