import { supabase } from "@/integrations/supabase/client";

export interface ProfileFormValues {
  full_name: string;
  phone: string;
  address: string;
  location: string;
  avatar_url: string;
}

export const fetchUserProfile = async (): Promise<ProfileFormValues> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, address, avatar_url, location")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    // Create empty profile if not found
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: userId,
        full_name: "",
        phone: "",
        address: "",
        avatar_url: "",
        location: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      throw new Error(insertError.message);
    }
    // Return empty profile
    return {
      full_name: "",
      phone: "",
      address: "",
      avatar_url: "",
      location: "",
    };
  }

  return data as ProfileFormValues;
};

export const updateUserProfile = async (
  profile: ProfileFormValues
): Promise<ProfileFormValues> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = userData.user.id;
  console.log("Updating profile with:", { id: userId, ...profile });

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    ...profile,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return profile;
};

export async function getAvatarSignedUrl(
  path: string | null
): Promise<string | null> {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("user-avatars")
    .createSignedUrl(path, 60 * 15); // valid for 15 minutes

  if (error) {
    console.error("Failed to get signed URL:", error.message);
    return null;
  }

  return data.signedUrl;
}
