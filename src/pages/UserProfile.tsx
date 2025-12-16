import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import AddressInput from "@/components/AddressInput";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Package,
  HelpCircle,
  LogOut,
  ArrowRight,
  Gift,
} from "lucide-react";

interface ProfileFormValues {
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileFormValues>({
    full_name: "",
    phone: "",
    address: "",
    avatar_url: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<ProfileFormValues>({
      defaultValues: profile,
      mode: "onBlur",
    });

  const avatarUrl = watch("avatar_url");
  const currentAddress = watch("address");

  // ------------------- Load Profile -------------------
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const savedProfile = localStorage.getItem("user_profile");
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);

          if (isMounted) {
            setProfile(parsed);
            reset(parsed);
            setLoadingProfile(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const loadedProfile: ProfileFormValues = {
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          avatar_url: data.avatar_url ?? "",
        };

        if (isMounted) {
          setProfile(loadedProfile);
          reset(loadedProfile);
          localStorage.setItem("user_profile", JSON.stringify(loadedProfile));
          setLoadingProfile(false);
        }
      } catch (err: unknown) {
        console.error("Failed to load profile", err);
        if (isMounted) {
          setIsEditing(true);
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user, reset]);

  // ------------------- Redirect if unauthenticated -------------------
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  // ------------------- Avatar Upload -------------------
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        return toast({
          title: "Invalid file",
          description: "Select an image less than 5MB",
          variant: "destructive",
        });
      }

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user?.id}_${Date.now()}.${fileExt}`;

        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl)
          throw new Error("Failed to get public URL");

        // Update form & state
        setValue("avatar_url", publicUrlData.publicUrl);
        setProfile((prev) => ({
          ...prev,
          avatar_url: publicUrlData.publicUrl,
        }));

        toast({
          title: "Avatar updated",
          description: "Profile picture uploaded successfully",
        });
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Upload failed";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    },
    [setValue, toast, user?.id]
  );

  // ------------------- Logout -------------------
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setProfile({ full_name: "", phone: "", address: "", avatar_url: "" });
      reset();
      localStorage.removeItem("user_profile");
      navigate("/");
    }
  }, [signOut, reset, navigate, toast]);

  // ------------------- Profile Update -------------------
  const onSubmit = useCallback(
    async (data: ProfileFormValues) => {
      setUpdating(true);
      setUpdateError(null);
      try {
        const { error } = await supabase
          .from("profiles")
          .update(data)
          .eq("id", user?.id);
        if (error) throw error;

        setProfile(data);
        setIsEditing(false);
        localStorage.setItem("user_profile", JSON.stringify(data));

        toast({
          title: "Profile updated",
          description: "Your changes were saved successfully",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Update failed";
        setUpdateError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setUpdating(false);
      }
    },
    [user?.id, toast]
  );

  // ------------------- Quick Actions -------------------
  const quickActions = useMemo(
    () => [
      {
        icon: Gift,
        label: "Refer & Earn",
        href: "/referral",
        description: "Earn Rs 10 per referral",
      },
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
    ],
    []
  );

  if (loadingProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your account settings and preferences
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-5 md:mb-6 relative group">
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
                        avatarUrl || profile.avatar_url || "/images/avatar.jpg"
                      }
                      alt="Avatar"
                      className="w-full h-full rounded-full border-4 border-green-100 object-cover group-hover:opacity-75 transition-all shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        Change Photo
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      +
                    </div>
                  </label>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {profile.full_name || "Your Name"}
                </h2>
                <p className="text-green-600 text-sm sm:text-base font-medium break-words">
                  {user.email}
                </p>
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
                    {profile.full_name || "Not provided"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile.phone || "Not provided"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {profile.address || "Not provided"}
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
                    />
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700"
                      >
                        Address
                      </label>
                      <AddressInput
                        value={watch("address")}
                        setValue={(val) =>
                          setValue("address", val, { shouldValidate: true })
                        }
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={updating || !watch("address")?.trim()}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      >
                        {updating ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          reset(profile);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            <div className="mt-6 p-6 text-center rounded">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full max-w-xs mx-auto flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
