import React, { useRef } from "react";
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
  identifier: string;
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
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
    inputsRef.current[idx].value = val;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const target = e.currentTarget;

    if (e.key === "Backspace") {
      if (!target.value && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        inputsRef.current[idx - 1].value = "";
      }
    } else if (e.key.match(/[0-9]/)) {
      target.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").slice(0, 6).split("");
    pasteData.forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = char;
      }
    });
  };

  const handleVerify = () => {
    const otp = inputsRef.current.map((input) => input.value).join("");
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

        <div className="flex justify-center gap-2 mb-4">
          {[...Array(6)].map((_, i) => (
            <Input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-10 h-12 text-center text-xl font-mono tracking-wider"
              ref={(el) => (inputsRef.current[i] = el!)}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              disabled={loading}
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-2"
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
