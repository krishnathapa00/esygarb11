import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";

export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("esygrab_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("esygrab_device_id", deviceId);
  }
  return deviceId;
};

const DeviceIdUpdater: React.FC = () => {
  const { user } = useAuthContext();

  const updateDeviceIdInDB = async (userId: string, deviceId: string) => {
    try {
      const { data: referralUse, error: fetchError } = await supabase
        .from("referral_uses")
        .select("id, referral_code_id")
        .eq("referred_user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Failed to fetch referral:", fetchError);
        return;
      }

      if (!referralUse) {
        console.log("No referral found for user", userId);
        return;
      }

      const { data, error: updateError } = await supabase
        .from("referral_uses")
        .update({ device_id: deviceId })
        .eq("id", referralUse.id);

      if (updateError) {
        console.error("Failed to update device ID:", updateError);
      } else {
        console.log("Device ID updated in DB:", data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    const deviceId = getOrCreateDeviceId();
    updateDeviceIdInDB(user.id, deviceId);
  }, [user]);

  return null;
};

export default DeviceIdUpdater;
