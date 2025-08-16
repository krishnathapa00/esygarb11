import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });
  const [session, setSession] = useState<Session | null>(null);

  // Clear only our custom storage, not Supabase's auth tokens
  const clearStorage = useCallback(() => {
    localStorage.removeItem('esygrab_session');
    localStorage.removeItem('esygrab_auth_user');
  }, []);

  // Get user profile with role
  const getUserProfile = useCallback(async (user: User): Promise<AuthUser | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        role: profile.role || 'customer',
        isVerified: true
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Set authenticated user with session persistence
  const setAuthUser = useCallback(async (user: User | null, skipProfile = false) => {
    if (!user) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
      clearStorage();
      return;
    }

    if (skipProfile) {
      // Use timeout to defer profile fetch and avoid deadlocks
      setTimeout(async () => {
        const authUser = await getUserProfile(user);
        if (authUser) {
          setState({
            user: authUser,
            loading: false,
            isAuthenticated: true
          });
          
          // Store session with 7-day expiry and current activity
          const sessionData = {
            user: authUser,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            lastActivity: Date.now()
          };
          localStorage.setItem('esygrab_session', JSON.stringify(sessionData));
        }
      }, 0);
    } else {
      const authUser = await getUserProfile(user);
      if (authUser) {
        setState({
          user: authUser,
          loading: false,
          isAuthenticated: true
        });
        
        // Store session with 7-day expiry and current activity
        const sessionData = {
          user: authUser,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          lastActivity: Date.now()
        };
        localStorage.setItem('esygrab_session', JSON.stringify(sessionData));
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false
        });
      }
    }
  }, [getUserProfile, clearStorage]);

  // Check for expired sessions and clean up
  const checkSessionValidity = useCallback(() => {
    const storedSession = localStorage.getItem('esygrab_session');
    if (!storedSession) return false;

    try {
      const { expiresAt, lastActivity } = JSON.parse(storedSession);
      const now = Date.now();
      
      // Check if session expired (7 days) or inactive for more than 1 day
      if (now > expiresAt || (now - lastActivity) > (24 * 60 * 60 * 1000)) {
        clearStorage();
        return false;
      }
      return true;
    } catch {
      clearStorage();
      return false;
    }
  }, [clearStorage]);

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event);
        setSession(session);
        
        if (event === 'SIGNED_OUT' || !session) {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false
          });
          clearStorage();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Skip profile fetch on auth state change to avoid deadlocks
          setAuthUser(session.user, true);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        if (!checkSessionValidity()) {
          // Session invalid, sign out
          await supabase.auth.signOut();
          if (mounted) {
            setState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await setAuthUser(session.user);
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthUser, checkSessionValidity, clearStorage]);

  // Sign in with email/password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  // Sign in with OTP
  const signInWithOtp = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  // Verify OTP
  const verifyOtp = useCallback(async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      clearStorage();
      await supabase.auth.signOut();
      setSession(null);
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clearStorage]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  return {
    ...state,
    signInWithPassword,
    signInWithOtp,
    verifyOtp,
    signUp,
    signOut,
    resetPassword
  };
};