import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerifyOTP: (otp: string) => void;
  onResendOTP: () => void;
  loading: boolean;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerifyOTP,
  onResendOTP,
  loading
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '']);
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 4 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      onVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4).split('');
        if (digits.length === 4) {
          setOtp(digits);
          onVerifyOTP(digits.join(''));
        }
      });
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '']);
    onResendOTP();
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">OTP Verification</h2>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-2">
                We have sent a verification code to
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {phoneNumber}
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  maxLength={1}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => onVerifyOTP(otp.join(''))}
                disabled={otp.some(digit => digit === '') || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-gray-600 hover:text-emerald-600 text-sm font-medium underline-offset-4"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
