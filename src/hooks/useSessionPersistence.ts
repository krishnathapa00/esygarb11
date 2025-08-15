import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionPersistence = () => {
  useEffect(() => {
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
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // Check session on mount
    checkAndRefreshSession();

    // Set up automatic token refresh 5 minutes before expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed successfully');
          
          // Fetch user role for refreshed session
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          // Update stored session data with role
          const sessionData = {
            user: {
              id: session.user.id,
              email: session.user.email || "",
              isVerified: true,
              role: profile?.role || 'customer',
            },
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            lastActivity: Date.now()
          };
          localStorage.setItem("esygrab_session", JSON.stringify(sessionData));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
};