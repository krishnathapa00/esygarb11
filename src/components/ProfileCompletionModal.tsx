import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthProvider';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: (updated: boolean) => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
    address: ''
  });

  const [originalData, setOriginalData] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
    address: ''
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .single();

        // Get saved address from localStorage
        const savedLocation = localStorage.getItem('esygrab_user_location');
        let addressFromStorage = '';
        if (savedLocation) {
          try {
            const locationData = JSON.parse(savedLocation);
            addressFromStorage = locationData.address || '';
          } catch (e) {
            console.error('Error parsing saved location:', e);
          }
        }

        const profileData = {
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          email: user.email || '',
          address: profile?.address || addressFromStorage
        };

        setFormData(profileData);
        setOriginalData(profileData);
        
        // Determine if this is a new user
        const isNew = !profile?.full_name || !profile?.phone;
        setIsNewUser(isNew);
        setHasChanges(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsNewUser(true);
      }
    };

    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(formData).some(key => 
      formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
    );
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields for new users
    if (isNewUser && (!formData.full_name.trim() || !formData.phone.trim())) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your full name and contact number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully"
      });

      onClose(true);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save profile",
        variant: "destructive"
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
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
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              required={isNewUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your contact number"
              required={isNewUser}
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
              Default Delivery Address
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Open location selector
                  window.location.href = '/map-location';
                }}
                className="ml-auto text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your delivery address"
              className="min-h-[60px]"
            />
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
              disabled={loading || (isNewUser && (!formData.full_name.trim() || !formData.phone.trim()))}
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