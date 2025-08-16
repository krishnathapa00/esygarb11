import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithPassword, signInWithOtp, verifyOtp, resetPassword } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToRole = (role: string) => {
    const from = location.state?.from?.pathname || '/';
    
    switch (role) {
      case 'admin':
      case 'super_admin':
        navigate('/admin/dashboard');
        break;
      case 'delivery_partner':
        navigate('/delivery-partner/dashboard');
        break;
      default:
        navigate(from);
        break;
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const { error, data } = await signInWithPassword(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else if (data?.user) {
      // Get user role and redirect
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('esygrab_auth_user') || '{}');
        if (user.role) {
          redirectToRole(user.role);
        } else {
          navigate('/');
        }
      }, 100);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;

    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'Check your email for the verification code'
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp || otp.length !== 6) return;

    setLoading(true);
    const { error, data } = await verifyOtp(email, otp);
    setLoading(false);

    if (error) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else if (data?.user) {
      toast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
      
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('esygrab_auth_user') || '{}');
        if (user.role) {
          redirectToRole(user.role);
        } else {
          navigate('/');
        }
      }, 100);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Reset Link Sent',
        description: 'Check your email for the password reset link'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">EG</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8 border">
            <Tabs defaultValue="password" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">Email OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={handleResetPassword}
                    disabled={loading || !email}
                    className="text-sm"
                  >
                    Forgot password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="otp">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otp-email">Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <Button 
                      onClick={handleSendOtp} 
                      className="w-full" 
                      disabled={loading || !email}
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otp-code">Enter OTP</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        OTP sent to {email}
                      </p>
                    </div>

                    <Button 
                      onClick={handleVerifyOtp} 
                      className="w-full" 
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleSendOtp}
                      className="w-full"
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;