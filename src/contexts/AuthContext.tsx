import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  isVerified: boolean;
  role?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  location?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  sendOtp: (email: string) => Promise<{ error?: { message: string } }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ error?: { message: string } }>;
  resendOtp: (email: string) => Promise<{ error?: { message: string } }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Clear all role-based sessions
  const clearAllSessions = () => {
    localStorage.removeItem("esygrab_admin_session");
    localStorage.removeItem("esygrab_delivery_session");
    localStorage.removeItem("esygrab_user_session");
    localStorage.removeItem("esygrab_session");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    localStorage.removeItem("guest_cart");
    localStorage.removeItem("auth_redirect_url");
  };

  // Store role-specific session
  const storeRoleSession = (user: User, role: string) => {
    const sessionData = {
      user,
      role,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      lastActivity: Date.now()
    };
    
    // Clear other role sessions first
    clearAllSessions();
    
    // Store in role-specific key
    const sessionKey = `esygrab_${role}_session`;
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            isVerified: true,
            role: profile?.role || 'customer',
          };
          
          setUser(user);
          setIsAuthenticated(true);
          storeRoleSession(user, profile?.role || 'customer');
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) setLoading(false);
      }
    };

    // Set up auth state listener - NO AUTO REDIRECTS
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            isVerified: true,
            role: profile?.role || 'customer',
          };
          
          setUser(user);
          setIsAuthenticated(true);
          storeRoleSession(user, profile?.role || 'customer');
        } else {
          setUser(null);
          setIsAuthenticated(false);
          clearAllSessions();
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("Error sending OTP:", error.message);
        return { error: { message: error.message } };
      }

      console.log(`OTP sent to ${email}`);
      return {};
    } catch (err: any) {
      console.error("Unexpected error sending OTP:", err.message);
      return {
        error: { message: "Unexpected error occurred while sending OTP." },
      };
    }
  }, []);

  const resendOtp = useCallback(
    async (email: string) => {
      console.log(`Resending OTP to ${email}`);
      return await sendOtp(email);
    },
    [sendOtp]
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error || !data.session || !data.user) {
        console.error("OTP verification failed:", error?.message);
        return {
          error: { message: error?.message || "OTP verification failed." },
        };
      }

      // Fetch user role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const newUser: User = {
        id: data.user.id,
        email: email,
        isVerified: true,
        role: profile?.role || 'customer',
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));

      return {};
    } catch (err: any) {
      console.error("Unexpected error verifying OTP:", err.message);
      return {
        error: { message: "Unexpected error occurred while verifying OTP." },
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all role-based sessions
      localStorage.removeItem("esygrab_admin_session");
      localStorage.removeItem("esygrab_delivery_session");
      localStorage.removeItem("esygrab_user_session");
      localStorage.removeItem("esygrab_session");
      localStorage.removeItem("user");
      localStorage.removeItem("lastActivity");
      localStorage.removeItem("guest_cart");
      localStorage.removeItem("auth_redirect_url");
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    resendOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
