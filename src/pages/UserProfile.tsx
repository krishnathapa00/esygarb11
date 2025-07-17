import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import TextAreaField from "@/components/TextAreaField";
import SingleImageUpload from "@/components/SingleImageUpload";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserProfile,
  updateUserProfile,
  ProfileFormValues,
} from "@/services/profileService";

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
      const updatedProfile = await updateUserProfile(data);
      setProfile(updatedProfile);
      reset(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved"
      });
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update profile");
      toast({
        title: "Update failed",
        description: err.message || "Failed to update profile",
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
              <div className="w-24 h-24 mx-auto mb-4">
                <img
                  src={avatarUrl || profile?.avatar_url || "/images/avatar.jpg"}
                  alt="Avatar"
                  className="w-full h-full rounded-full border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/avatar.jpg";
                  }}
                />
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
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Edit Profile
                    </Button>
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profile Photo
                    </label>
                    <SingleImageUpload
                      onImageUpload={handleImageUpload}
                      currentImage={avatarUrl}
                      folder="avatars"
                    />
                  </div>

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

          {/* Sign Out Button at the bottom */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
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