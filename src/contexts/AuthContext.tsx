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

  useEffect(() => {
    let mounted = true;
    let activityInterval: NodeJS.Timeout;
    let hasRedirected = false;

    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (session?.user) {
          // Fetch user role from profiles table
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
          
          // Store session info
          const sessionData = {
            user,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
            lastActivity: Date.now()
          };
          localStorage.setItem("esygrab_session", JSON.stringify(sessionData));
          
          // Handle redirects only on SIGNED_IN event and prevent multiple redirects
          if (event === 'SIGNED_IN' && !hasRedirected) {
            hasRedirected = true;
            const redirectUrl = localStorage.getItem("auth_redirect_url");
            
            if (redirectUrl) {
              localStorage.removeItem("auth_redirect_url");
              setTimeout(() => window.location.replace(redirectUrl), 100);
            } else {
              const role = user.role || 'customer';
              setTimeout(() => {
                if (role === 'admin' || role === 'super_admin') {
                  window.location.replace('/admin/dashboard');
                } else if (role === 'delivery_partner') {
                  window.location.replace('/delivery-partner/dashboard');
                } else {
                  window.location.replace('/');
                }
              }, 100);
            }
          }
          
          // Clean up guest cart
          localStorage.removeItem("guest_cart");
          
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("esygrab_session");
          hasRedirected = false;
        }
        
        setLoading(false);
      }
    );

    // Check for existing session with enhanced validation
    const initializeAuth = async () => {
      try {
        // Check stored session first
        const storedSession = localStorage.getItem("esygrab_session");
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          const now = Date.now();
          
          // Check if session is expired (7 days) or inactive (1 day)
          const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
          const oneDayAgo = now - (24 * 60 * 60 * 1000);
          
          if (sessionData.expiresAt < now || sessionData.lastActivity < sevenDaysAgo) {
            console.log('Session expired - removing stored session');
            localStorage.removeItem("esygrab_session");
            await supabase.auth.signOut();
            if (mounted) setLoading(false);
            return;
          }
          
          // Check for inactivity (1 day)
          if (sessionData.lastActivity < oneDayAgo) {
            console.log('Session expired due to inactivity');
            localStorage.removeItem("esygrab_session");
            await supabase.auth.signOut();
            if (mounted) setLoading(false);
            return;
          }
        }

        // Get current Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          localStorage.removeItem("esygrab_session");
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Valid session found, restoring auth state');
          
          // Fetch user role from profiles table
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
          
          if (mounted) {
            setUser(user);
            setIsAuthenticated(true);
            
            // Update stored session
            const sessionData = {
              user,
              expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
              lastActivity: Date.now()
            };
            localStorage.setItem("esygrab_session", JSON.stringify(sessionData));
          }
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem("esygrab_session");
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (activityInterval) clearInterval(activityInterval);
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
      
      // Clear all auth-related storage
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
