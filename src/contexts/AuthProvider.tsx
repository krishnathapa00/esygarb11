import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import applyReferralCode from "@/services/addReferralCode";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  referralCode?: string;
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
  deleteAccount: () => Promise<void>;
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

  /** ----- Set authenticated user ----- */
  const setAuthUser = useCallback(async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    // Check if profile exists
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
      return;
    }

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: profile.role,
      isVerified: true,
    });
  }, []);

  /** ----- Listen to auth state changes ----- */
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await setAuthUser(sessionData.session.user);
        await handleReferral(sessionData.session.user);
      }
      setLoading(false);
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          await setAuthUser(session.user);
          await handleReferral(session.user);
        }
        if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => subscription?.subscription.unsubscribe();
  }, [setAuthUser]);

  /** ----- Referral handling ----- */
  const handleReferral = async (supabaseUser: User) => {
    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, has_used_referral")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    let isNewUser = false;

    // Create profile if missing
    if (!profile) {
      isNewUser = true;
      await supabase.from("profiles").insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        has_used_referral: false,
      });
    }

    // Only apply referral for new users and if code exists
    const referralCode = localStorage.getItem("referral_code");

    if (isNewUser && referralCode) {
      try {
        await applyReferralCode(referralCode);

        // mark referral used
        await supabase
          .from("profiles")
          .update({ has_used_referral: true })
          .eq("id", supabaseUser.id);

        localStorage.removeItem("referral_code");
      } catch (err) {
        console.error("Referral application failed", err);
      }
    }
  };

  /** ----- Auth methods ----- */
  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.user) await setAuthUser(data.user);
    return { data, error };
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
  };

  /** ----- Safe account deletion ----- */
  const deleteAccount = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Delete profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      if (profileError) throw profileError;

      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) throw authError;

      // Clear local state
      setUser(null);
    } catch (err) {
      console.error("Account deletion failed:", err);
    } finally {
      setLoading(false);
    }
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
        deleteAccount,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
