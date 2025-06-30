import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string; // now email
  onVerifyOTP: (otp: string) => void;
  onResendOTP: () => void;
  loading: boolean;
  cooldown: number;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  identifier,
  onVerifyOTP,
  onResendOTP,
  loading,
  cooldown,
}) => {
  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerifyOTP(otp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Verify OTP
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-gray-600 text-sm mb-4">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium">{identifier}</span>
        </div>

        <Input
          type="text"
          value={otp}
          onChange={handleChange}
          maxLength={6}
          disabled={loading}
          className="text-center text-xl tracking-widest font-mono"
          placeholder="______"
        />

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || loading}
          className="w-full mt-4"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onResendOTP}
            disabled={cooldown > 0 || loading}
            className="text-emerald-600 text-sm disabled:text-gray-400"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
