import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth'
}) => {
  const { user, loading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // Redirect based on user's actual role
      const redirectPath = getRoleRedirectPath(user.role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

const getRoleRedirectPath = (role: string): string => {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'delivery_partner':
      return '/delivery-partner/dashboard';
    default:
      return '/';
  }
};