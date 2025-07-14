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
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Fetch user profile data
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          email: user.email || "",
          address: data.address || "",
          avatar_url: data.avatar_url || ""
        });
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
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
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          address: profileData.address,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
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

  const handleFeatureClick = (feature: string) => {
    toast({ 
      title: `${feature} coming soon`, 
      description: `${feature} feature will be available soon.` 
    });
  };

  if (!user) return null;

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
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
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
                      {profileData.phone_number || "No phone number"}
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
                      <div className="space-y-2">
                        <Button 
                          onClick={handleSave} 
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
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
                <CardTitle className="text-xl font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
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
                    <Label htmlFor="phone_number" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={profileData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
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
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={!isEditing}
                      className="transition-colors"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => navigate("/orders")}
                >
                  <History className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Order History</div>
                    <div className="text-xs text-muted-foreground">View past orders</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => navigate("/cart")}
                >
                  <Package className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Cart</div>
                    <div className="text-xs text-muted-foreground">Check current items</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* More Options */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Support & Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-muted"
                  onClick={() => handleFeatureClick("Cancelled Orders")}
                >
                  <X className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Cancelled Orders</div>
                    <div className="text-xs text-muted-foreground">View cancelled items</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-muted"
                  onClick={() => handleFeatureClick("Returns & Refunds")}
                >
                  <RotateCcw className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Returns & Refunds</div>
                    <div className="text-xs text-muted-foreground">Manage returns</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-muted"
                  onClick={() => handleFeatureClick("Payment Support")}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Payment Support</div>
                    <div className="text-xs text-muted-foreground">Payment issues</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-muted"
                  onClick={() => toast({ title: "Support", description: "For support, please contact us at support@esygrab.com" })}
                >
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Report Problem</div>
                    <div className="text-xs text-muted-foreground">Get help</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out Section */}
        <Card className="border-destructive/20 mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-destructive">Sign Out</h3>
                <p className="text-sm text-muted-foreground">You'll need to sign in again to access your account</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="ml-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;