import { useState } from "react";

export const useReferralValidator = () => {
  const [loading, setLoading] = useState(false);

  const validateReferral = async ({
    referredUserId,
    deviceId,
    location,
    autoDetected,
  }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-referral`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sb-access-token")}`,
          },
          body: JSON.stringify({
            user_id: referredUserId,
            device_id: deviceId,
            address: location,
            auto_detect: autoDetected,
          }),
        }
      );

      const result = await response.json();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { validateReferral, loading };
};
