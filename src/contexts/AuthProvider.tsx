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
    const fetchUserProfile = async (user: any) => {
      if (!user) return null;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return {
        id: user.id,
        email: user.email!,
        role: profile?.role || "user",
        isVerified: user.user_metadata.isVerified ?? false,
      };
    };

    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        
        fetchUserProfile(session?.user)
          .then((userData) => setUser(userData))
          .catch(() => setUser(null));
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
