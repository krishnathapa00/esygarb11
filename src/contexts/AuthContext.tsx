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
    otp: string,
    navigate?: (path: string) => void
  ) => Promise<{ error?: { message: string } }>;
  resendOtp: (email: string) => Promise<{ error?: { message: string } }>;
  signUp: (phone: string, fullName: string, role: string) => Promise<{ error?: { message: string } }>;
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

  useEffect(() => {
    const initializeAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          isVerified: true,
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            isVerified: true,
          };
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
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

  const verifyOtp = useCallback(async (email: string, otp: string, navigate?: (path: string) => void) => {
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

      const newUser: User = {
        id: data.user.id,
        email: email,
        isVerified: true,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Redirect to payment page after successful verification for new users
      if (navigate) {
        navigate("/payment");
      }

      return {};
    } catch (err: any) {
      console.error("Unexpected error verifying OTP:", err.message);
      return {
        error: { message: "Unexpected error occurred while verifying OTP." },
      };
    }
  }, []);

  const signUp = useCallback(async (phone: string, fullName: string, role: string) => {
    try {
      // For delivery partners, we'll just return success since the actual signup
      // will happen during OTP verification
      return {};
    } catch (err: any) {
      console.error("Unexpected error during signup:", err.message);
      return {
        error: { message: "Unexpected error occurred during signup." },
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    resendOtp,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
