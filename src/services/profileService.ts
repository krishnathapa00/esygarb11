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
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Profile not found");
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
