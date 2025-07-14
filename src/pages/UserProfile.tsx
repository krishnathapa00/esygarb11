import React, { useState, useEffect } from "react";
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
  Camera
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          address: profileData.address,
          avatar_url: profileData.avatar_url
        })
        .eq('id', user?.id);

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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-3 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
                    <AvatarFallback className="text-xl bg-green-100 text-green-700">
                      {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => toast({ title: "Photo upload", description: "Photo upload feature coming soon!" })}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{profileData.full_name || "User"}</h2>
                  <p className="text-gray-600">{profileData.email}</p>
                  <p className="text-sm text-gray-500">{profileData.phone_number}</p>
                </div>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={profileData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => navigate("/orders")}
                >
                  <Package className="h-4 w-4 mr-3" />
                  Order History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => navigate("/cart")}
                >
                  <Package className="h-4 w-4 mr-3" />
                  View Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* More Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">More Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-gray-800"
                  onClick={() => handleFeatureClick("Cancelled Orders")}
                >
                  <X className="h-4 w-4 mr-3" />
                  Cancelled Orders
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-gray-800"
                  onClick={() => handleFeatureClick("Returns")}
                >
                  <RotateCcw className="h-4 w-4 mr-3" />
                  Returns
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-gray-800"
                  onClick={() => handleFeatureClick("Refunds")}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Refunds
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-gray-800"
                  onClick={() => handleFeatureClick("Payment Support")}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payment Support
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-gray-800"
                  onClick={() => toast({ title: "Support", description: "For support, please contact us at support@esygrab.com" })}
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Report Problem
                </Button>
              </div>

              <Separator className="my-6" />
              
              <Button 
                variant="outline" 
                className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;