import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  phone: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<{ error?: { message: string } }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ error?: { message: string } }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Send OTP via Supabase
  const sendOtp = useCallback(async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('Error sending OTP:', error.message);
        return { error: { message: error.message } };
      }

      console.log(`OTP sent to ${phone}`);
      return {};
    } catch (err: any) {
      console.error('Unexpected error sending OTP:', err.message);
      return { error: { message: 'Unexpected error occurred while sending OTP.' } };
    }
  }, []);

  // Verify OTP and sign in
  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error || !data.session || !data.user) {
        console.error('OTP verification failed:', error?.message);
        return { error: { message: error?.message || 'OTP verification failed.' } };
      }

      const newUser: User = {
        id: data.user.id,
        phone: phone,
        isVerified: true,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));

      return {};
    } catch (err: any) {
      console.error('Unexpected error verifying OTP:', err.message);
      return { error: { message: 'Unexpected error occurred while verifying OTP.' } };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  }, []);

  // On app load, check existing session
  useEffect(() => {
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session || !data.session.user) {
        localStorage.removeItem('user');
        return;
      }

      const user: User = {
        id: data.session.user.id,
        phone: data.session.user.phone || '',
        isVerified: true,
      };

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
