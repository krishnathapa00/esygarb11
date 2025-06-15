import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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

  // Generates a 4-digit OTP
  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Unified sendOtp: Create account if new user, otherwise let login flow handle it.
  const sendOtp = async (phoneNumber: string) => {
    try {
      const otpCode = generateOtp();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 mins expiry

      // Save OTP for this phone
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // No distinction between "signup" and "login"
      console.log(`OTP for ${phoneNumber}: ${otpCode}`);
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${phoneNumber}. Check console for demo OTP: ${otpCode}`,
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Magic login/signup: If user doesn't exist, create; if exists, just log in.
  const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
      // Check OTP validity
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

      // Try finding email for phone (your magic login model: email made from phone)
      const email = `${phoneNumber.replace(/\D/g, '')}@esygrab.app`;
      // Password is always 'demo-password-123'
      const password = 'demo-password-123';

      // Try to sign in; if fail, create and then sign in.
      let { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // User not found, create them first ("magic signup")
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          phone: phoneNumber,
          options: {
            data: {
              full_name: '',
              phone_number: phoneNumber,
            }
          }
        });
        if (!signUpError) {
          // Retry sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    // Optionally, redirect to login page
    window.location.href = "/login";
  };

  const value = {
    user,
    session,
    loading,
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
