import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { fetchUserProfile } from "@/services/profileService";
import { showToast } from "@/components/Toast";

export const useRequireCompleteProfile = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const hasShownToastRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/profile") {
      hasShownToastRef.current = false;
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user || loading || hasShownToastRef.current) return;

      if (user.role !== "customer") return;

      hasShownToastRef.current = true;

      try {
        const profile = await fetchUserProfile();

        if (
          !profile.full_name?.trim() ||
          !profile.phone?.trim() ||
          !profile.address?.trim()
        ) {
          showToast("Please complete your profile before proceeding.", "error");

          if (window.location.pathname !== "/profile") {
            navigate("/profile");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkProfile();
  }, [user, loading, navigate]);
};
