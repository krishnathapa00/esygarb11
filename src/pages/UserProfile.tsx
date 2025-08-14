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
  const { user, loading: authLoading, logout } = useAuth();
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
      await logout();
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">My Account</h1>
        <div className="bg-card shadow-sm rounded-lg p-6">
          <div className="md:flex gap-10">
            <aside className="w-full md:w-1/3 text-center mb-6 md:mb-0">
              <div className="w-24 h-24 mx-auto mb-4 relative group">
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
                    className="w-full h-full rounded-full border object-cover group-hover:opacity-75 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/avatar.jpg";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">Change Photo</span>
                  </div>
                </label>
              </div>
              <h2 className="text-lg font-medium">{profile?.full_name || "Your Name"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </aside>

            <section className="flex-1">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Full Name</p>
                      <p className="text-muted-foreground">{profile?.full_name || "-"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-muted-foreground">{profile?.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-muted-foreground">{profile?.address || "-"}</p>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsEditing(true)}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Edit Profile</h3>
                          <p className="text-sm text-gray-500">Update your information</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/order-history')}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <History className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Order History</h3>
                          <p className="text-sm text-gray-500">View past orders</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/order-tracking-lookup')}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Track Orders</h3>
                          <p className="text-sm text-gray-500">Track current orders</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/support')}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <HelpCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Support</h3>
                          <p className="text-sm text-gray-500">Get help & support</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                >
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
                      className="bg-primary hover:bg-primary/90"
                    >
                      {updating ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset(profile || {});
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {updateError && (
                    <p className="text-destructive text-sm">{updateError}</p>
                  )}
                </form>
              )}
            </section>
          </div>

          {/* Sign Out Button at the bottom center */}
          <div className="mt-8 pt-6 border-t border-border flex justify-center">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground px-8"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;