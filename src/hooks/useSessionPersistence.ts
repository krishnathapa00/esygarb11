import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthProvider';

export const useSessionPersistence = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    // Update user activity in session storage
    const updateActivity = () => {
      if (user) {
        const storedSession = localStorage.getItem('esygrab_session');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            sessionData.lastActivity = Date.now();
            localStorage.setItem('esygrab_session', JSON.stringify(sessionData));
          } catch (error) {
            console.error('Failed to update session activity:', error);
          }
        }
      }
    };

    // Check if we need to refresh the session on page load
    const checkAndRefreshSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }

        if (session) {
          // Check if token is close to expiring (within 5 minutes)
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = (expiresAt || 0) - now;
          
          if (timeUntilExpiry < 300) { // Less than 5 minutes
            console.log('Token expiring soon, refreshing...');
            await supabase.auth.refreshSession();
          }
          
          // Update activity on session check
          updateActivity();
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // Check session on mount
    checkAndRefreshSession();

    // Set up periodic activity updates (every 5 minutes when user is active)
    const activityInterval = setInterval(updateActivity, 5 * 60 * 1000);

    // Set up automatic token refresh 5 minutes before expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session && user) {
          console.log('Token refreshed successfully');
          updateActivity();
        }
      }
    );

    return () => {
      clearInterval(activityInterval);
      subscription.unsubscribe();
    };
  }, [user]);
};