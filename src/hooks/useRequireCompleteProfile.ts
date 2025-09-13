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
      if (!user || loading) return;

      // Only for customer
      if (user.role !== "customer") return;

      try {
        const profile = await fetchUserProfile();

        const isIncomplete =
          !profile.full_name?.trim() ||
          !profile.phone?.trim() ||
          !profile.address?.trim();

        if (isIncomplete) {
          if (!hasShownToastRef.current) {
            showToast(
              "Please complete your profile before proceeding.",
              "error"
            );
            hasShownToastRef.current = true;
          }

          if (location.pathname !== "/profile") {
            navigate("/profile");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    checkProfile();
  }, [user, loading, location.pathname, navigate]);
};
