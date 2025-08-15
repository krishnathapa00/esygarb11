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

  useEffect(() => {
    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            isVerified: true,
          };
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("lastActivity", Date.now().toString());
          
          // Handle guest cart merge and redirect after login
          const guestCart = localStorage.getItem("guest_cart");
          const redirectUrl = localStorage.getItem("auth_redirect_url");
          
          if (guestCart) {
            // This will be handled by the cart context
            localStorage.removeItem("guest_cart");
          }
          
          if (redirectUrl) {
            localStorage.removeItem("auth_redirect_url");
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 100);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          localStorage.removeItem("lastActivity");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      if (session?.user) {
        const lastActivity = localStorage.getItem("lastActivity");
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
        
        // If user was inactive for more than 3 days, log them out
        if (lastActivity && parseInt(lastActivity) < threeDaysAgo) {
          console.log('Session expired due to inactivity');
          supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          isVerified: true,
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("lastActivity", Date.now().toString());
      }
      setLoading(false);
    });

    // Update last activity every 5 minutes when user is active
    const activityInterval = setInterval(() => {
      if (isAuthenticated) {
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      authListener?.subscription.unsubscribe();
      clearInterval(activityInterval);
    };
  }, [isAuthenticated]);

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
