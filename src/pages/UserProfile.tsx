import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, User, Mail, Phone, Edit3, Save, X, LogOut, Package, RotateCcw, CreditCard, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    address: ""
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
          address: data.address || ""
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
          address: profileData.address
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave} 
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={profileData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & More Options */}
          <div className="space-y-6">
            {/* Orders Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/orders")}
                >
                  <Package className="h-4 w-4 mr-3" />
                  Order History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/cart")}
                >
                  <Package className="h-4 w-4 mr-3" />
                  View Cart
                </Button>
              </CardContent>
            </Card>

            {/* More Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">More Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600"
                  onClick={() => toast({ title: "Feature coming soon", description: "Cancelled orders feature will be available soon." })}
                >
                  <X className="h-4 w-4 mr-3" />
                  Cancelled Orders
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600"
                  onClick={() => toast({ title: "Feature coming soon", description: "Returns feature will be available soon." })}
                >
                  <RotateCcw className="h-4 w-4 mr-3" />
                  Returns
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600"
                  onClick={() => toast({ title: "Feature coming soon", description: "Refunds feature will be available soon." })}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Refunds
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600"
                  onClick={() => toast({ title: "Feature coming soon", description: "Payment support will be available soon." })}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payment Support
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600"
                  onClick={() => toast({ title: "Support", description: "For support, please contact us at support@esygrab.com" })}
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Report Problem
                </Button>

                <Separator className="my-4" />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
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
    </div>
  );
};

export default UserProfile;