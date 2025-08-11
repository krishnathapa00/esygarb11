import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import TextAreaField from "@/components/TextAreaField";
import {
  fetchUserProfile,
  updateUserProfile,
  ProfileFormValues,
} from "@/services/profileService";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarSignedUrl } from "@/services/profileService";

const UserProfile: React.FC = () => {
  const [signedAvatarUrl, setSignedAvatarUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<ProfileFormValues>({
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
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
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

  useEffect(() => {
    if (!profile?.avatar_url) {
      setSignedAvatarUrl(null);
      return;
    }

    async function fetchSignedUrl() {
      const url = await getAvatarSignedUrl(profile.avatar_url);
      setSignedAvatarUrl(url);
    }

    fetchSignedUrl();
  }, [profile?.avatar_url]);

  const avatarUrl = watch("avatar_url");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError.message);
      return;
    }

    // Save file path (not public URL) to profile DB
    try {
      await updateUserProfile({
        ...profile,
        avatar_url: filePath, // save path like "avatars/userid/avatar.png"
      } as ProfileFormValues);

      reset({ ...watch(), avatar_url: filePath });
      setProfile((prev) => (prev ? { ...prev, avatar_url: filePath } : null));
    } catch (err) {
      console.error("Failed to update profile avatar:", err);
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
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">Error loading profile: {error}</p>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">My Account</h1>
        <div className="bg-white shadow-sm rounded-lg p-6 md:flex gap-10">
          <aside className="w-full md:w-1/3 text-center mb-6 md:mb-0">
            <img
              src={
                avatarUrl && avatarUrl.startsWith("http")
                  ? avatarUrl
                  : signedAvatarUrl || "/images/avatar.jpg"
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full border mx-auto"
            />
            <h2 className="mt-4 text-lg font-medium">{watch("full_name")}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </aside>
          <section className="flex-1">
            {!isEditing ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium">Full Name</p>
                  <p>{profile?.full_name || "-"}</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p>{profile?.phone || "-"}</p>
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p>{profile?.address || "-"}</p>
                </div>
                <button
                  className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
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
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  }}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                  }}
                />

                <TextAreaField
                  label="Address"
                  name="address"
                  register={register}
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-60"
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reset(profile || {});
                      setIsEditing(false);
                    }}
                    className="text-gray-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
                {updateError && (
                  <p className="text-red-600 mt-2">{updateError}</p>
                )}
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
