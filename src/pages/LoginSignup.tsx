
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginSignup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const { sendOtp, verifyOtp, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (activeTab === 'signup' && !fullName.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter your full name",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (activeTab === 'signup') {
        const { error: signUpError } = await signUp(phoneNumber, fullName);
        if (signUpError) {
          toast({
            title: "Signup Error",
            description: signUpError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      
      const { error } = await sendOtp(phoneNumber);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsOtpSent(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await verifyOtp(phoneNumber, otp);
      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setIsOtpSent(false);
    setOtp('');
    setPhoneNumber('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-4 py-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">EsyGrab</h1>
            <p className="text-gray-600 mt-2">Groceries at your doorstep in minutes</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          type="tel"
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleSendOtp}
                        disabled={phoneNumber.length < 10 || loading}
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp">
                          Enter OTP sent to {phoneNumber}
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
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 4 || loading}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                      <Button 
                        variant="link" 
                        className="w-full text-sm text-gray-600"
                        onClick={resetForm}
                      >
                        Change Phone Number
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      <div>
                        <Label htmlFor="signupName">Full Name</Label>
                        <Input
                          id="signupName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="signupPhone">Phone Number</Label>
                        <Input
                          id="signupPhone"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          type="tel"
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleSendOtp}
                        disabled={phoneNumber.length < 10 || !fullName.trim() || loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="signupOtp">
                          Enter OTP sent to {phoneNumber}
                        </Label>
                        <Input
                          id="signupOtp"
                          placeholder="Enter 4-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 4 || loading}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                      <Button 
                        variant="link" 
                        className="w-full text-sm text-gray-600"
                        onClick={resetForm}
                      >
                        Change Phone Number
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
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

export default LoginSignup;
