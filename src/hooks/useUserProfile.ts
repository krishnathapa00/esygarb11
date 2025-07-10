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

      const payload: ProfileInsert = {
        id: user.id,
        address: updates.address ?? null,
        location: updates.location ?? null,
        avatar_url: updates.avatar_url ?? null,
        full_name: updates.full_name ?? null,
        phone: updates.phone ?? null,
        role: updates.role ?? null,
        created_at: updates.created_at ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

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
