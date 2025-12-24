import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { fetchUserProfile } from "@/services/profileService";
import { toast } from "./use-toast";

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
            toast({
              title: "Please complete your profile before proceeding.",
              variant: "destructive",
            });

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
