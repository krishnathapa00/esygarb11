import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Mail, Phone, User, Rocket, Gift, Package, Zap, ChevronRight, Users, Star, Facebook, Instagram } from 'lucide-react';
import esygrabLogo from '@/assets/esygrab-logo.png';

const Waitlist = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "✅ You're on the waitlist!",
        description: "We'll notify you before launch.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-8">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  ✅ You're on the waitlist!
                </h2>
                <p className="text-gray-600 text-xl leading-relaxed">
                  We'll notify you before launch and give you early access to Nepal's fastest delivery service.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 text-lg font-semibold"
                size="lg"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img src={esygrabLogo} alt="EsyGrab" className="mx-auto h-20 w-auto" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Groceries Delivered in <span className="text-green-600">15 Minutes</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Coming Soon to Nepal
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-16">
              Fresh produce, daily essentials, and snacks at your door — faster than ever
            </p>
            
            {/* Waitlist Form */}
            <div className="max-w-md mx-auto">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Join the Waitlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="pl-12 py-3 text-base rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="pl-12 py-3 text-base rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-12 py-3 text-base rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-xl"
                      size="lg"
                    >
                      {loading ? "Joining..." : "Join the Waitlist"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white/80">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Join the Waitlist?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">🚀 15-minute delivery</h3>
              <p className="text-gray-600">Lightning-fast delivery to your doorstep in just 15 minutes</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">💸 Exclusive launch offers</h3>
              <p className="text-gray-600">Special discounts and free delivery for early users</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">🎁 Early user rewards</h3>
              <p className="text-gray-600">Earn points and unlock exclusive benefits</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">📦 Live order tracking</h3>
              <p className="text-gray-600">Track your order in real-time from store to door</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How EsyGrab Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 text-white font-bold text-2xl">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign up now</h3>
              <p className="text-gray-600">Join our waitlist to be notified when we launch in your area</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 text-white font-bold text-2xl">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get early access before launch</h3>
              <p className="text-gray-600">Be among the first to experience Nepal's fastest delivery service</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 text-white font-bold text-2xl">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Order and receive groceries in 15 minutes</h3>
              <p className="text-gray-600">Start ordering fresh groceries with lightning-fast delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Join 2,000+ early users excited for fast delivery
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Be part of the revolution in grocery delivery across Nepal
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <img src={esygrabLogo} alt="EsyGrab" className="h-12 w-auto" />
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Facebook className="w-8 h-8" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Instagram className="w-8 h-8" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-2.08v5.73a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.31 0 .62.05.9.15V2.8a5.06 5.06 0 00-.9-.09A5.09 5.09 0 005.8 7.78a5.09 5.09 0 005.08 5.08A5.09 5.09 0 0016 7.78v-1.09z"/>
                </svg>
              </a>
            </div>
            
            <p className="text-gray-400 text-center">
              © 2024 EsyGrab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;