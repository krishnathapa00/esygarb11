import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
      return;
    }

    // Fetch user profile after logging in
    const userId = data?.user?.id;
    if (!userId) {
      setLoading(false);
      toast({
        title: "Login Error",
        description: "User not found after login.",
        variant: "destructive",
      });
      return;
    }

    // Get profile (role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      toast({
        title: "Profile Not Found",
        description: "Could not retrieve your profile or role information.",
        variant: "destructive",
      });
      return;
    }

    if (profile.role !== "admin") {
      // User is not admin, sign out and show error
      await supabase.auth.signOut();
      toast({
        title: "Access Denied",
        description: "You are not an admin. Please use a valid admin account to log in.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login successful!",
      description: "Welcome to the admin panel.",
    });
<<<<<<< HEAD
    navigate("/admin/dashboard");
=======
    navigate("/admin-dashboard");
>>>>>>> 398f62f (code pushed by undead)
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Enter your email address above first.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/admin-login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "Password reset link sent.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EsyGrab Admin</h1>
          <p className="text-gray-600 mt-2">Login to access the admin panel</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              className={`text-sm font-medium ${
                loading || !email
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:text-green-700 cursor-pointer"
              } transition-colors`}
              onClick={handlePasswordReset}
              type="button"
              disabled={loading || !email}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Use your admin email and password.<br />
            If you haven't signed up, register via the customer or hybrid signup flow first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
