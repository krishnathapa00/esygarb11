import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import Header from "@/components/Header";
import InputField from "@/components/InputField";
import TextAreaField from "@/components/TextAreaField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  User,
  History,
  Package,
  HelpCircle,
  LogOut,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  fetchUserProfile,
  updateUserProfile,
  ProfileFormValues,
} from "@/services/profileService";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<ProfileFormValues>({
      defaultValues: { full_name: "", phone: "", address: "", avatar_url: "" },
      mode: "onBlur",
    });

  const avatarUrl = watch("avatar_url");

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        reset(data);
        if (!data?.full_name || !data?.phone) setIsEditing(true);
      })
      .catch(() => setIsEditing(true))
      .finally(() => setLoadingProfile(false));
  }, [user, reset]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  // ------------------- Handlers -------------------
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return toast({
        title: "Invalid file",
        description: "Select an image less than 5MB",
        variant: "destructive",
      });
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-avatars").getPublicUrl(filePath);
    const newAvatarUrl = `${publicUrl}?t=${Date.now()}`;
    setValue("avatar_url", newAvatarUrl);

    await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user?.id);
    toast({
      title: "Avatar updated",
      description: "Profile picture updated successfully",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setProfile(null);
      reset();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch {
      toast({
        title: "Logout failed",
        description: "Could not log out",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updatedProfile = await updateUserProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        location: data.location || "",
        avatar_url: data.avatar_url || "",
      });
      setProfile(updatedProfile);
      reset(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Profile saved successfully",
      });
    } catch (err: any) {
      setUpdateError(err?.message || "Failed to update profile");
      toast({
        title: "Update failed",
        description: err?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // ------------------- Quick Actions -------------------
  const quickActions = [
    {
      icon: History,
      label: "Order History",
      href: "/order-history",
      description: "View past orders",
    },
    {
      icon: Package,
      label: "Track Orders",
      href: "/order-tracking-lookup",
      description: "Track current orders",
    },
    {
      icon: HelpCircle,
      label: "Support",
      href: "/help-center",
      description: "Get support",
    },
  ];

  // ------------------- Mobile Layout -------------------
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 py-8 pt-20 pb-24 space-y-6">
          <div className="flex items-center mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-3 p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
          </div>

          <Card className="border-border">
            <CardHeader className="pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm text-foreground">
                    {user.email}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Quick Actions
            </h3>
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href}>
                <Card className="border-border hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {action.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="border-border">
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ------------------- Desktop Layout -------------------
  if (loadingProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your account settings and preferences
        </p>

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
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files[0])
                    }
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer block w-full h-full"
                  >
                    <img
                      src={
                        avatarUrl || profile?.avatar_url || "/images/avatar.jpg"
                      }
                      alt="Avatar"
                      className="w-full h-full rounded-full border-4 border-green-100 object-cover group-hover:opacity-75 transition-all shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">
                        Change Photo
                      </span>
                    </div>
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || "Your Name"}
                </h2>
                <p className="text-green-600 font-medium">{user.email}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!isEditing ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {profile?.full_name || "Not provided"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile?.phone || "Not provided"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {profile?.address || "Not provided"}
                  </p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">
                    Edit Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
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
                        className="flex-1 border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                    {updateError && (
                      <p className="text-red-600">{updateError}</p>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="space-y-3 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                  <Link key={i} to={action.href}>
                    <Card className="border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <action.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {action.label}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout */}
            <Card className="bg-red-50 border-red-200 shadow-xl mt-6">
              <CardContent className="p-6 text-center">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full flex items-center justify-center"
                >
                  <LogOut className="h-5 w-5 mr-2" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
