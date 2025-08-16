import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthProvider';

export const useActivityTracker = () => {
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let activityTimer: NodeJS.Timeout;

    // Function to update activity in database
    const updateActivity = async () => {
      try {
        const { error } = await supabase.rpc('update_user_activity', {
          user_id: user.id
        });
        
        if (error) {
          console.error('Failed to update user activity:', error);
        }
      } catch (error) {
        console.error('Activity tracking error:', error);
      }
    };

    // Update activity immediately
    updateActivity();

    // Update session activity in localStorage on user interactions
    const updateSessionActivity = () => {
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
    };

    // Set up activity tracking based on user interaction
    const trackActivity = () => {
      // Clear existing timer
      if (activityTimer) clearTimeout(activityTimer);
      
      // Update session activity immediately on interaction
      updateSessionActivity();
      
      // Update database activity after a short delay to avoid too frequent calls
      activityTimer = setTimeout(updateActivity, 60000); // 1 minute delay
    };

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Update activity every 5 minutes
    const intervalId = setInterval(() => {
      updateActivity();
      updateSessionActivity();
    }, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      clearInterval(intervalId);
      if (activityTimer) clearTimeout(activityTimer);
    };
  }, [isAuthenticated, user]);
};