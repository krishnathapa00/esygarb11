import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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

  // Clear all local storage
  const clearStorage = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('esygrab') || key.includes('auth') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
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

  // Set authenticated user
  const setAuthUser = useCallback(async (user: User | null) => {
    if (!user) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
      return;
    }

    const authUser = await getUserProfile(user);
    if (authUser) {
      setState({
        user: authUser,
        loading: false,
        isAuthenticated: true
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('esygrab_auth_user', JSON.stringify(authUser));
    } else {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    }
  }, [getUserProfile]);

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          await setAuthUser(session?.user || null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state change:', event);
          await setAuthUser(session?.user || null);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthUser]);

  // Sign in with email/password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      clearStorage();
      
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
  }, [clearStorage]);

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
      clearStorage();
      
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
  }, [clearStorage]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      clearStorage();
      
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
  }, [clearStorage]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearStorage();
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