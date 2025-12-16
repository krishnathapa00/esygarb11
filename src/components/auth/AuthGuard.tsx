import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  redirectTo = "/auth",
}) => {
  const { user, loading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated)
    return <Navigate to={redirectTo} state={{ from: location }} replace />;

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user!.role)) {
      const redirectMap: Record<string, string> = {
        admin: "/admin/dashboard",
        super_admin: "/admin/dashboard",
        delivery_partner: "/delivery-partner/dashboard",
        customer: "/",
      };
      return <Navigate to={redirectMap[user!.role] || "/"} replace />;
    }
  }

  return <>{children}</>;
};

