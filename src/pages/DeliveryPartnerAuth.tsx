import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DeliveryPartnerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignUp = async () => {
    if (!email || !password || !fullName || !vehicleType || !licenseNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/delivery-partner/dashboard`,
          data: {
            full_name: fullName,
            role: 'delivery_partner',
            vehicle_type: vehicleType,
            license_number: licenseNumber,
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account, then login below.",
        });
        setActiveTab('login');
        setEmail('');
        setPassword('');
        setFullName('');
        setVehicleType('');
        setLicenseNumber('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  const handleLogin = async () => {
    console.log('handleLogin function called!', { email, password: password ? 'provided' : 'missing' });
    
    if (!email || !password) {
      console.log('Missing email or password');
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    console.log('Starting login process...', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Auth result:', { data: !!data, error: error?.message });
      
      if (error) {
        console.error('Login error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before logging in. Or ask the admin to disable email confirmation in Supabase settings.';
        }
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data?.user) {
        console.log('Login successful, checking profile...');
        
        // Check if user is delivery partner
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        console.log('Profile check:', { profile, profileError });
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast({
            title: "Profile Error",
            description: "Could not fetch profile information",
            variant: "destructive",
          });
        } else if (profile?.role === 'delivery_partner') {
          console.log('Access granted, navigating to dashboard...');
          toast({
            title: "Welcome Back!",
            description: "You have successfully logged in to your delivery partner account.",
          });
          
          // Don't manually navigate - let AuthContext handle it
          // setTimeout(() => {
          //   navigate('/delivery-partner/dashboard');
          // }, 1000);
        } else {
          console.log('Access denied - not a delivery partner');
          toast({
            title: "Access Denied",
            description: "This account is not registered as a delivery partner.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        }
      } else {
        console.error('No user data received');
        toast({
          title: "Login Error",
          description: "No user data received",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setVehicleType('');
    setLicenseNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-3 md:px-4 py-3 md:py-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Back to Home</span>
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Delivery Partner Portal</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Join EsyGrab's delivery network</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                <TabsTrigger value="signup" className="text-xs md:text-sm">Join Us</TabsTrigger>
                <TabsTrigger value="login" className="text-xs md:text-sm">Partner Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="signupName" className="text-sm">Full Name</Label>
                    <Input
                      id="signupName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupEmail" className="text-sm">Email Address</Label>
                    <Input
                      id="signupEmail"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword" className="text-sm">Password</Label>
                    <Input
                      id="signupPassword"
                      placeholder="Enter your password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleType" className="text-sm">Vehicle Type</Label>
                    <Input
                      id="vehicleType"
                      placeholder="e.g., Motorcycle, Bicycle, Scooter"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber" className="text-sm">License/Vehicle Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="Enter license or vehicle number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
                    onClick={handleSignUp}
                    disabled={!email || !password || !fullName || !vehicleType || !licenseNumber || loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Partner Account'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="login">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="loginEmail" className="text-sm">Email Address</Label>
                    <Input
                      id="loginEmail"
                      placeholder="Enter your registered email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loginPassword" className="text-sm">Password</Label>
                    <Input
                      id="loginPassword"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="text-sm"
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
                    onClick={() => {
                      console.log('Login button clicked!');
                      handleLogin();
                    }}
                    disabled={!email || !password || loading}
                  >
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 text-center space-y-2">
              <p className="text-xs md:text-sm text-gray-600">
                <a 
                  href="/auth/reset"
                  className="text-green-600 hover:text-green-700"
                >
                  Forgot your password?
                </a>
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                Questions about becoming a partner? <br />
                Contact us at support@esygrab.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerAuth;