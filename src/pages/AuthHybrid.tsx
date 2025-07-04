import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import OTPVerificationModal from "@/components/OTPVerificationModal";
import { Input } from "@/components/ui/input";

const AuthHybrid = () => {
  const [email, setEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { sendOtp, verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);

    if (error) {
      toast({
        title: "OTP Error",
        description: error.message || "Could not send OTP",
        variant: "destructive",
      });
    } else {
      setIsOtpModalOpen(true);
      setCooldown(120);
      toast({
        title: "OTP Sent Successfully",
        description: "Please check your email for the verification code.",
      });
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Verified Successfully",
        description: "Welcome to EasyGrab!",
      });
      setIsOtpModalOpen(false);
      navigate("/");
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    const { error } = await resendOtp(email);
    setLoading(false);

    if (error) {
      toast({
        title: "Resend Failed",
        description: error.message || "Could not resend OTP",
        variant: "destructive",
      });
    } else {
      setCooldown(120);
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
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">EG</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to EasyGrab
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

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Your information is secure and encrypted
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
