
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';

interface SMSServiceProps {
  onOTPSent: (phoneNumber: string) => void;
  onOTPVerified: (isValid: boolean) => void;
}

const SMSService: React.FC<SMSServiceProps> = ({ onOTPSent, onOTPVerified }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Generate a random 6-digit OTP
      const randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(randomOTP);

      // Simulate SMS sending (replace with actual NTC/Ncell API)
      console.log(`Sending OTP ${randomOTP} to ${phoneNumber}`);
      
      // In production, you would call:
      // await sendSMSToNTC(phoneNumber, `Your EsyGrab OTP is: ${randomOTP}`);
      // or
      // await sendSMSToNcell(phoneNumber, `Your EsyGrab OTP is: ${randomOTP}`);

      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        onOTPSent(phoneNumber);
        alert(`OTP sent to ${phoneNumber}. For demo: ${randomOTP}`);
      }, 2000);
    } catch (error) {
      setLoading(false);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = () => {
    if (otp === generatedOTP) {
      onOTPVerified(true);
      alert('OTP verified successfully!');
    } else {
      onOTPVerified(false);
      alert('Invalid OTP. Please try again.');
    }
  };

  const sendSMSToNTC = async (phone: string, message: string) => {
    // NTC SMS API integration
    const response = await fetch('/api/sms/ntc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    return response.json();
  };

  const sendSMSToNcell = async (phone: string, message: string) => {
    // Ncell SMS API integration
    const response = await fetch('/api/sms/ncell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    return response.json();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Phone Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!otpSent ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={sendOTP}
              disabled={loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Enter OTP</label>
              <Input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full"
              />
            </div>
            <Button 
              onClick={verifyOTP}
              className="w-full"
            >
              Verify OTP
            </Button>
            <Button 
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setGeneratedOTP('');
              }}
              variant="outline"
              className="w-full"
            >
              Change Phone Number
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSService;
