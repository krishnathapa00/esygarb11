import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import TextAreaField from "@/components/TextAreaField";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, History, Package, HelpCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserProfile,
  updateUserProfile,
  ProfileFormValues,
} from "@/services/profileService";
import SingleImageUpload from "@/components/SingleImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
      avatar_url: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    setError(null);

    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        reset(data);
        // If user has no profile data, automatically enter edit mode
        if (!data?.full_name || !data?.phone) {
          setIsEditing(true);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
        // If profile doesn't exist, enter edit mode for new user
        setIsEditing(true);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [user, reset]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const avatarUrl = watch("avatar_url");

  const handleImageUpload = (url: string) => {
    setValue("avatar_url", url);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setUpdating(true);
    setUpdateError(null);

    try {
      // Ensure all required fields are strings
      const profileData: ProfileFormValues = {
        full_name: data.full_name || "",
        phone: data.phone || "", 
        address: data.address || "",
        location: data.location || "",
        avatar_url: data.avatar_url || ""
      };

      const updatedProfile = await updateUserProfile(profileData);
      setProfile(updatedProfile);
      reset(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved"
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      const errorMessage = err?.message || "Failed to update profile";
      setUpdateError(errorMessage);
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading profile: {error}</p>
            <Button onClick={() => setIsEditing(true)}>Create Profile</Button>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 relative group">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      toast({
                        title: "Invalid file type",
                        description: "Please select an image file",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please select an image smaller than 5MB",
                        variant: "destructive"
                      });
                      return;
                    }

                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                      const filePath = `avatars/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('user-avatars')
                        .upload(filePath, file);

                      if (uploadError) {
                        throw uploadError;
                      }

                      const { data: { publicUrl } } = supabase.storage
                        .from('user-avatars')
                        .getPublicUrl(filePath);

                      const newAvatarUrl = `${publicUrl}?t=${Date.now()}`;
                      setValue("avatar_url", newAvatarUrl);
                      
                      // Update the profile immediately in the database
                      await supabase
                        .from('profiles')
                        .update({ avatar_url: newAvatarUrl })
                        .eq('id', user.id);
                      
                      toast({
                        title: "Image uploaded successfully",
                        description: "Your avatar has been updated"
                      });

                    } catch (error: any) {
                      toast({
                        title: "Upload failed",
                        description: error.message || "Failed to upload image",
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="cursor-pointer block w-full h-full"
                >
                  <img
                    src={avatarUrl || profile?.avatar_url || "/images/avatar.jpg"}
                    alt="Avatar"
                    className="w-full h-full rounded-full border-4 border-green-100 object-cover group-hover:opacity-75 transition-all shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/avatar.jpg";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  </div>
                </label>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || "Your Name"}</h2>
                <p className="text-green-600 font-medium">{user.email}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  ✓ Verified Account
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!isEditing ? (
            <>
              {/* Personal Information Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {profile?.full_name || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phone Number</label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {profile?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {profile?.address || "Not provided"}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Edit Profile Information
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
                  onClick={() => navigate('/order-history')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <History className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Order History</h3>
                        <p className="text-gray-600">View your past orders and purchases</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
                  onClick={() => navigate('/order-tracking-lookup')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                        <MapPin className="h-8 w-8 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Track Orders</h3>
                        <p className="text-gray-600">Track your current orders in real-time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:scale-105"
                  onClick={() => navigate('/support')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                        <HelpCircle className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Support</h3>
                        <p className="text-gray-600">Get help and customer support</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-green-100 rounded-full">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Account Status</h3>
                        <p className="text-green-600 font-medium">Active & Verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Edit Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      name="full_name"
                      register={register}
                      required
                    />
                    <InputField
                      label="Phone Number"
                      name="phone"
                      register={register}
                      required
                      pattern={{
                        value: /^\+?[0-9\s\-]{7,15}$/,
                        message: "Invalid phone number",
                      }}
                    />
                  </div>
                  <TextAreaField
                    label="Address"
                    name="address"
                    register={register}
                    rows={3}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset(profile || {});
                        setIsEditing(false);
                      }}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 rounded-lg font-medium text-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {updateError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{updateError}</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="mt-8">
          <Card className="bg-red-50 border-red-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Account Management</h3>
              <p className="text-red-600 mb-4">Securely sign out of your account</p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;