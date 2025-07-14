
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DeliveryPartnerAuth = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  
  const { sendOtp, verifyOtp, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (activeTab === 'signup' && (!fullName.trim() || !vehicleType.trim() || !licenseNumber.trim())) {
        toast({
          title: "Missing Information",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (activeTab === 'signup') {
        const { error: signUpError } = await signUp(email, fullName, 'delivery_partner');
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
      
      const { error } = await sendOtp(email);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
        });
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
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await verifyOtp(email, otp);
      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to EsyGrab!",
          description: "Your delivery partner account has been verified successfully.",
        });
        navigate('/delivery-dashboard');
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
    setEmail('');
    setFullName('');
    setVehicleType('');
    setLicenseNumber('');
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
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Portal</h1>
            <p className="text-gray-600 mt-2">Join EsyGrab's delivery network</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Join Us</TabsTrigger>
                <TabsTrigger value="login">Partner Login</TabsTrigger>
              </TabsList>
              
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
                        <Label htmlFor="signupEmail">Email Address</Label>
                        <Input
                          id="signupEmail"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Input
                          id="vehicleType"
                          placeholder="e.g., Motorcycle, Bicycle, Scooter"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber">License/Vehicle Number</Label>
                        <Input
                          id="licenseNumber"
                          placeholder="Enter license or vehicle number"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleSendOtp}
                        disabled={!email || !fullName || !vehicleType || !licenseNumber || loading}
                      >
                        {loading ? 'Creating Account...' : 'Join as Partner'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="signupOtp">
                          Enter OTP sent to {email}
                        </Label>
                        <Input
                          id="signupOtp"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || loading}
                      >
                        {loading ? 'Verifying...' : 'Verify & Start Earning'}
                      </Button>
                      <Button 
                        variant="link" 
                        className="w-full text-sm text-gray-600"
                        onClick={resetForm}
                      >
                        Change Email Address
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          placeholder="Enter your registered email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleSendOtp}
                        disabled={!email || !email.includes('@') || loading}
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp">
                          Enter OTP sent to {email}
                        </Label>
                        <Input
                          id="otp"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || loading}
                      >
                        {loading ? 'Verifying...' : 'Login to Dashboard'}
                      </Button>
                      <Button 
                        variant="link" 
                        className="w-full text-sm text-gray-600"
                        onClick={resetForm}
                      >
                        Change Email Address
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-2">
              <p className="text-sm text-gray-600">
                <a 
                  href="/auth/reset"
                  className="text-green-600 hover:text-green-700"
                >
                  Forgot your password?
                </a>
              </p>
              <p className="text-sm text-gray-600">
                Questions about becoming a partner? <br />
                Contact us at +977 9865053325
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerAuth;
