import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error?: { message: string }; data?: any }>;
  signInWithOtp: (email: string) => Promise<{ error?: { message: string } }>;
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{ error?: { message: string }; data?: any }>;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ error?: { message: string }; data?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: { message: string } }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on refresh
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          role: (data.session.user.user_metadata.role as string) || "user",
          isVerified: data.session.user.user_metadata.isVerified ?? false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initSession();

    // Listen to login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: (session.user.user_metadata.role as string) || "user",
            isVerified: session.user.user_metadata.isVerified ?? false,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
