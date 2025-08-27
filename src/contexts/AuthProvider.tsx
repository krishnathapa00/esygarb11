import React, { createContext, useContext } from "react";
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

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
