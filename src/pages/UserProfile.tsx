import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  LogOut, 
  Package, 
  RotateCcw, 
  CreditCard, 
  HelpCircle, 
  AlertTriangle,
  Camera,
  Upload,
  MapPin,
  History,
  Loader2,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Load profile data
  useEffect(() => {
    if (profile && user) {
      setProfileData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: user.email || "",
        address: profile.address || "",
        avatar_url: profile.avatar_url || ""
      });
    } else if (user && !profileLoading) {
      // Set defaults if no profile
      setProfileData({
        full_name: "",
        phone: user.phone || "",
        email: user.email || "",
        address: "",
        avatar_url: ""
      });
    }
  }, [profile, user, profileLoading]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = data.publicUrl;
      
      // Update local state immediately for UI feedback
      setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updates = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        avatar_url: profileData.avatar_url
      };

      const result = await updateProfile(updates);

      if (result.error) {
        toast({
          title: "Update failed",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use OpenStreetMap Nominatim (free geocoding service)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.display_name || `${latitude}, ${longitude}`;
              handleInputChange("address", address);
            } else {
              // Fallback to coordinates
              handleInputChange("address", `${latitude}, ${longitude}`);
            }
          } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback to coordinates
            const { latitude, longitude } = position.coords;
            handleInputChange("address", `${latitude}, ${longitude}`);
          }
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location access denied",
            description: "Please allow location access or enter your address manually.",
            variant: "destructive"
          });
          setIsDetectingLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your address manually.",
        variant: "destructive"
      });
      setIsDetectingLocation(false);
    }
  };

  const handleFeatureClick = (feature: string) => {
    toast({ 
      title: `${feature} coming soon`, 
      description: `${feature} feature will be available soon.` 
    });
  };

  if (!user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-3 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-border shadow-lg">
                      <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} className="object-cover" />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">{profileData.full_name || "User"}</h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-1" />
                      {profileData.phone || "No phone number"}
                    </div>
                    {profileData.address && (
                      <div className="flex items-center justify-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profileData.address}
                      </div>
                    )}
                  </div>
                  <div className="w-full pt-4">
                    {!isEditing ? (
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Editing
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  {isEditing && (
                    <Button 
                      onClick={handleSave}
                      disabled={loading}
                      className="ml-auto"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      disabled={!isEditing}
                      className="transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted cursor-not-allowed pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons</p>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Complete Address</Label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleDetectLocation}
                            disabled={isDetectingLocation}
                            className="flex-1"
                          >
                            {isDetectingLocation ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Navigation className="h-4 w-4 mr-2" />
                            )}
                            Auto Detect Location
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">OR</span>
                          </div>
                        </div>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="transition-colors"
                          placeholder="Enter your address manually"
                        />
                      </div>
                    ) : (
                      <Input
                        id="address"
                        value={profileData.address}
                        disabled
                        className="bg-muted cursor-not-allowed transition-colors"
                        placeholder="No address provided"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-border mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleFeatureClick("Order History")}
                    className="w-full justify-start"
                  >
                    <History className="h-4 w-4 mr-3" />
                    Order History
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleFeatureClick("Payment Methods")}
                    className="w-full justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-3" />
                    Payment Methods
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleFeatureClick("Help & Support")}
                    className="w-full justify-start"
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;