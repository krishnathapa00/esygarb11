import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Partial<ProfileInsert>;

interface Profile {
  full_name?: string;
  phone?: string;
  address?: string;
  location?: string;
  avatar_url?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, address, location, avatar_url")
      .eq("id", user.id)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error(error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!user) return { error: { message: "Not authenticated" } };

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: updates.full_name,
          phone: updates.phone,
          address: updates.address,
          location: updates.location,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error updating profile", error);
        return { error: { message: error.message } };
      }

      await fetchProfile();
      return {};
    },
    [user, fetchProfile]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, updateProfile };
}
