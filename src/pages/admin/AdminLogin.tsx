import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthProvider";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signInWithPassword, resetPassword } = useAuthContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signInWithPassword(email, password);

    if (error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
      return;
    }

    if (data?.user) {
      setLoading(false);

      toast({
        title: "Login successful!",
        description: "Welcome to the admin panel.",
      });

      // Let the auth context handle role-based navigation
      // The AuthGuard will redirect to appropriate dashboard
      navigate("/admin/dashboard");
    } else {
      setLoading(false);
      toast({
        title: "Login Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
    }

    if (data?.user) {
      if (data.user.role === "admin") {
        toast({
          title: "Login successful!",
          description: "Welcome to the admin panel.",
        });
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the admin panel.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Login Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
    }
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
    const { error } = await resetPassword(email);
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
        description: "Password reset link sent to your email.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="font-bold font-poppins bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              EsyGrab
            </span>{" "}
            Admin
          </h1>

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
            Use your admin email and password.
            <br />
            If you haven't signed up, register via the customer or hybrid signup
            flow first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
