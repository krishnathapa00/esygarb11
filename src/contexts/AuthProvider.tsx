import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signInWithOtp: (email: string) => Promise<any>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** ----- SESSION & ROLE MANAGEMENT ----- */
  const setAuthUser = useCallback(async (user: User | null) => {
    if (!user) return setUser(null);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "customer",
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(insertError);
        return;
      }

      setUser({
        id: user.id,
        email: user.email,
        role: "customer",
        isVerified: true,
      });

      return;
    }

    setUser({
      id: user.id,
      email: user.email,
      role: profile.role,
      isVerified: true,
    });

    localStorage.setItem(
      "esygrab_session",
      JSON.stringify({
        user: { id: user.id, role: profile.role, email: user.email },
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    );
  }, []);

  /** ----- AUTH STATE CHANGE LISTENER ----- */
  useEffect(() => {
    const localSession = localStorage.getItem("esygrab_session");

    if (localSession) {
      const parsed = JSON.parse(localSession);
      if (parsed.user && parsed.expiresAt > Date.now()) {
        setUser(parsed.user);
        setLoading(false);

        // Fetch fresh data async but keep loading state for smoother UX
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (sessionData?.session?.user) {
            setAuthUser(sessionData.session.user);
          }
        });

        return;
      }
    } else {
      localStorage.removeItem("esygrab_session");
    }

    // Subscribe to auth state changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setAuthUser(session?.user || null);
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await setAuthUser(sessionData.session.user);
      }
      setLoading(false);
    };

    init();

    return () => data?.subscription.unsubscribe();
  }, [setAuthUser]);

  /** ----- AUTH METHODS ----- */
  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error };
    if (data.user) await setAuthUser(data.user);
    return { data };
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (data?.user) await setAuthUser(data.user);
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("esygrab_session");
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signInWithPassword,
        signInWithOtp,
        verifyOtp,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
