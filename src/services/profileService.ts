import { supabase } from "@/integrations/supabase/client";

export interface ProfileFormValues {
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
}

export const fetchUserProfile = async (): Promise<ProfileFormValues> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = userData.user.id;

  // Fetch that user's existing profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Profile not found");

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

  // Fetch existing profile first — REQUIRED because of delivery_location
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (!existing) throw new Error("Existing profile not found");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...profile,

      delivery_location: existing.delivery_location,

      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as ProfileFormValues;
};

