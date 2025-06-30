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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

      const newUser: User = {
        id: data.user.id,
        email: email,
        isVerified: true,
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
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
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
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    resendOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
