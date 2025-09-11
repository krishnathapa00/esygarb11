import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import OTPVerificationModal from "@/components/OTPVerificationModal";
import { Input } from "@/components/ui/input";
import { fetchUserProfile } from "@/services/profileService";
import EsyLogo from "@/assets/logo/Esy.jpg";

const AuthHybrid = () => {
  const [email, setEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    user,
    loading: authLoading,
    signInWithOtp,
    verifyOtp,
  } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Enter a valid email",
        variant: "destructive",
      });
      return;
    }

    if (cooldown > 0) {
      toast({
        title: "Please Wait",
        description: `Wait ${cooldown}s before requesting another OTP`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      toast({
        title: "OTP Error",
        description: error.message || "Could not send OTP",
        variant: "destructive",
      });
      return;
    }

    setIsOtpModalOpen(true);
    setCooldown(30);
    toast({
      title: "OTP Sent",
      description: "Check your email for the verification code.",
    });
  };

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await verifyOtp(email, otp);

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.session) {
        toast({
          title: "Verification Error",
          description:
            "OTP verified but no session received. Please try signing in again.",
          variant: "destructive",
        });
        return;
      }

      const { user, session } = data;

      if (user && session) {
        toast({
          title: "Email Verified Successfully",
          description: "Welcome to Esygrab!",
          variant: "default",
        });

        setIsOtpModalOpen(false);

        const profile = await fetchUserProfile();

        if (
          !profile.full_name?.trim() ||
          !profile.phone?.trim() ||
          !profile.address?.trim()
        ) {
          toast({
            title: "Complete Your Profile",
            description: "Please complete your profile before proceeding.",
            variant: "destructive",
          });
          navigate("/profile");
        } else {
          navigate("/");
        }
      } else {
        toast({
          title: "Session Error",
          description: "Could not retrieve session after OTP verification.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description:
          "Something went wrong while verifying OTP. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      toast({
        title: "Resend Failed",
        description: error.message || "Could not resend OTP",
        variant: "destructive",
      });
    } else {
      setCooldown(30);
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCloseModal = () => {
    setIsOtpModalOpen(false);
  };

  useEffect(() => {
    setLoading(false);
    setEmail("");
    setIsOtpModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="hover:bg-white/50 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img
                  src={EsyLogo}
                  alt="EsyGrab Logo"
                  className="h-16 w-auto rounded-md"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to{" "}
              <span className="font-bold font-poppins bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EsyGrab
              </span>
            </h1>

            <p className="text-gray-600">
              Quick & secure login with your email
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
            />

            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </div>
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By continuing, you agree to our{" "}
                <span className="text-emerald-600 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-emerald-600 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Your information is secure and encrypted
            </p>
            <p className="text-sm text-gray-600">
              <span
                className="text-green-600 hover:text-green-700 cursor-pointer"
                onClick={() => navigate("/auth/reset")}
              >
                Forgot your password?
              </span>
            </p>
          </div>
        </div>
      </div>

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={handleCloseModal}
        identifier={email}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        loading={loading}
        cooldown={cooldown}
      />
    </div>
  );
};

export default AuthHybrid;
