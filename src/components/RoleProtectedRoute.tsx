import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/auth",
}) => {
  const { user, isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    console.log(
      `RoleProtectedRoute: Access denied. User role: ${userRole}, Allowed roles: ${allowedRoles.join(
        ", "
      )}`
    );
    
    if (userRole === "admin" || userRole === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "delivery_partner") {
      return <Navigate to="/delivery-partner/dashboard" replace />;
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
