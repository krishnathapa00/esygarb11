import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (phoneNumber: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signIn: (phoneNumber: string) => Promise<{ error: any }>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendOtp = async (phoneNumber: string) => {
    try {
      const otpCode = generateOtp();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      // Store OTP in database
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // In a real app, you would send SMS here
      console.log(`OTP for ${phoneNumber}: ${otpCode}`);
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${phoneNumber}. Check console for demo OTP: ${otpCode}`,
      });

      return { error: null };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { error };
    }
  };

  const signUp = async (phoneNumber: string, fullName: string, role: string = 'customer') => {
    try {
      // Create a dummy email for Supabase auth (since we're using phone-based auth)
      const email = `${phoneNumber.replace(/\D/g, '')}@esygrab.app`;
      const password = Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: phoneNumber,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            role: role,
          }
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (phoneNumber: string) => {
    try {
      // For demo purposes, we'll auto-create user if they don't exist
      const email = `${phoneNumber.replace(/\D/g, '')}@esygrab.app`;
      const password = Math.random().toString(36).substring(2, 15);

      // Try to sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'demo-password-123'
      });

      // If user doesn't exist, create them
      if (error && error.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: 'demo-password-123',
          phone: phoneNumber,
          options: {
            data: {
              full_name: '',
              phone_number: phoneNumber,
            }
          }
        });
        
        if (!signUpError) {
          // Sign them in after creation
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: 'demo-password-123'
          });
          error = signInError;
        } else {
          error = signUpError;
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
      // Verify OTP from database
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otp)
        .gt('expires_at', new Date().toISOString())
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        return { error: { message: 'Invalid or expired OTP' } };
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpData.id);

      // Sign in the user
      const signInResult = await signIn(phoneNumber);
      return signInResult;
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    verifyOtp,
    signOut,
    sendOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
