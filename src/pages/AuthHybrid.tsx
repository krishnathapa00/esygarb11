import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthHybrid = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await sendOtp(phone);
    setLoading(false);

    if (error) {
      toast({
        title: "OTP Error",
        description: error.message || "Could not send OTP",
        variant: "destructive"
      });
    } else {
      setIsOtpSent(true);
      toast({ title: 'OTP sent. Please check your phone.' });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 4-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Phone Verified",
        description: "Login successful!"
      });
      navigate('/');
    }
  };

  // Reset form when component mounts
  useEffect(() => {
    setLoading(false);
    setOtp('');
    setPhone('');
    setIsOtpSent(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-4 py-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">EsyGrab Login / Signup</h1>
            <p className="text-gray-600 mt-2">
              Fast login using your phone number
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-4">
            {!isOtpSent ? (
              <>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={handleSendOTP}
                  disabled={phone.length < 10 || loading}
                >
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="otp">
                    Enter OTP sent to {phone}
                  </Label>
                  <Input
                    id="otp"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 4 || loading}
                >
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </Button>
                <Button
                  variant="link"
                  className="w-full text-sm text-gray-600"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp('');
                    setPhone('');
                  }}
                >
                  Change Phone Number
                </Button>
              </>
            )}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHybrid;
