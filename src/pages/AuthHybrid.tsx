
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Hybrid authentication page: email/password or SMS OTP
const AuthHybrid = () => {
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [segment, setSegment] = useState<'login' | 'signup'>('login');
  // Email/password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // SMS OTP fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ----- Email/password handlers -----
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (segment === 'login') {
      // Login
      const { error } = await window.supabase.auth.signInWithPassword({
        email,
        password
      });
      setLoading(false);
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Check your credentials.',
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Login successful!' });
        navigate('/');
      }
    } else {
      // Signup with Supabase default magic link (also sets up password)
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await window.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      setLoading(false);
      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Signup successful!',
          description: 'A confirmation link has been sent to your email.'
        });
        setSegment('login');
      }
    }
  };

  // ----- SMS OTP handlers -----
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

  // Reset forms when switching methods
  React.useEffect(() => {
    setLoading(false);
    setOtp('');
    setPhone('');
    setIsOtpSent(false);
    setEmail('');
    setPassword('');
  }, [method, segment]);

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
              Fast login for Customers & Admins
            </p>
          </div>
          <div className="flex gap-2 mb-6">
            <Button
              variant={method === 'email' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMethod('email')}
            >
              Email
            </Button>
            <Button
              variant={method === 'sms' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMethod('sms')}
            >
              Phone Number
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            {method === 'email' ? (
              <form onSubmit={handleEmailAuth} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={loading}
                >
                  {loading
                    ? (segment === 'login' ? 'Logging in...' : 'Signing up...')
                    : (segment === 'login' ? 'Login' : 'Sign up')}
                </Button>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="text-green-600"
                    onClick={() => setSegment(segment === 'login' ? 'signup' : 'login')}
                  >
                    {segment === 'login'
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Login"}
                  </Button>
                  {segment === 'login' && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-green-600"
                      onClick={async () => {
                        if (!email) {
                          toast({
                            title: "Enter your email address above first.",
                            variant: "destructive"
                          });
                          return;
                        }
                        setLoading(true);
                        const redirectUrl = `${window.location.origin}/`;
                        const { error } = await window.supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
                        setLoading(false);
                        if (error) {
                          toast({
                            title: "Password Reset Failed",
                            description: error.message,
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "Check your email",
                            description: "Password reset link sent."
                          });
                        }
                      }}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500 text-center">
                  <div>Admin login: use your admin email + password.</div>
                  <div>Customer login: sign up with email or use SMS OTP tab.</div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
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
              </div>
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
