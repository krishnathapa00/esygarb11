import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '@/utils/sessionManager';

const AuthChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for any existing valid session and redirect appropriately
    const session = SessionManager.getCurrentSession();
    
    if (session) {
      console.log('AuthChecker: Found existing session for role:', session.role);
      SessionManager.redirectToRoleDashboard(session.role);
    } else {
      console.log('AuthChecker: No valid session found');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};

export default AuthChecker;