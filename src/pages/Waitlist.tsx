import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Mail, Phone, User, Zap, Gift, MapPin, Users, Facebook, Instagram, ShoppingCart, Clock, Target } from 'lucide-react';
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
        title: "✅ Thank you! You're officially on the EsyGrab waitlist.",
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                  <Check className="w-12 h-12" style={{ color: '#28a745' }} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  ✅ Thank you! You're officially on the EsyGrab waitlist.
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We'll notify you before launch. Stay tuned for updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="py-6 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <img src={esygrabLogo} alt="EsyGrab" className="h-12 w-auto" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Nepal's Fastest Grocery Delivery — <span style={{ color: '#28a745' }}>Coming Soon</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get fresh groceries, snacks, and daily essentials at your doorstep in 10-15 minutes. Be the first to experience convenience redefined.
          </p>
          
          {/* Waitlist Form */}
          <div className="max-w-xl mx-auto mb-8">
            <Card className="shadow-2xl border-0 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Join the Waitlist</h3>
                <p className="text-center text-gray-600 text-sm">Be among the first to experience Nepal's fastest delivery</p>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="text-left block text-sm font-semibold text-gray-800 mb-3">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-left block text-sm font-semibold text-gray-800 mb-3">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Your phone number"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-left block text-sm font-semibold text-gray-800 mb-3">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 w-full"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Joining...
                      </div>
                    ) : (
                      "🚀 Join the Waitlist"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-sm text-gray-500">
            No spam. Only early access, exclusive offers, and updates.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Join the EsyGrab Waitlist?
          </h2>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4 max-w-6xl mx-auto">
            <div className="text-center p-4 md:p-3">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-3">
                <Zap className="w-8 h-8" style={{ color: '#28a745' }} />
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">⚡ Ultra-fast 10-15 minute delivery</h3>
              <p className="text-gray-600 text-sm md:text-xs">Lightning-fast delivery to your doorstep in just 10-15 minutes</p>
            </div>

            <div className="text-center p-4 md:p-3">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-3">
                <Target className="w-8 h-8" style={{ color: '#28a745' }} />
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">💸 Exclusive launch-day discounts</h3>
              <p className="text-gray-600 text-sm md:text-xs">Special discounts and free delivery for early users</p>
            </div>

            <div className="text-center p-4 md:p-3">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-3">
                <Gift className="w-8 h-8" style={{ color: '#28a745' }} />
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">🎁 Early user rewards & loyalty perks</h3>
              <p className="text-gray-600 text-sm md:text-xs">Earn points and unlock exclusive benefits</p>
            </div>

            <div className="text-center p-4 md:p-3">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-3">
                <MapPin className="w-8 h-8" style={{ color: '#28a745' }} />
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">📍 Real-time order tracking in-app</h3>
              <p className="text-gray-600 text-sm md:text-xs">Track your order in real-time from store to door</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 md:mb-3 text-white font-bold text-2xl" style={{ backgroundColor: '#28a745' }}>
                1
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">Sign Up</h3>
              <p className="text-gray-600 text-sm md:text-xs">Join our waitlist to be notified when we launch in your area</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 md:mb-3 text-white font-bold text-2xl" style={{ backgroundColor: '#28a745' }}>
                2
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">Get early access before public launch</h3>
              <p className="text-gray-600 text-sm md:text-xs">Be among the first to experience Nepal's fastest delivery service</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 md:mb-3 text-white font-bold text-2xl" style={{ backgroundColor: '#28a745' }}>
                3
              </div>
              <h3 className="text-lg md:text-base font-bold text-gray-900 mb-2 md:mb-1">Shop and receive groceries in minutes</h3>
              <p className="text-gray-600 text-sm md:text-xs">Start ordering fresh groceries with lightning-fast delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Thousands are already in line…
          </h2>
          <p className="text-lg text-gray-600">
            Join 500+ early users waiting to try EsyGrab
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <img src={esygrabLogo} alt="EsyGrab" className="h-10 w-auto opacity-80" />
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-2.08v5.73a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.31 0 .62.05.9.15V2.8a5.06 5.06 0 00-.9-.09A5.09 5.09 0 005.8 7.78a5.09 5.09 0 005.08 5.08A5.09 5.09 0 0016 7.78v-1.09z"/>
                </svg>
              </a>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-green-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-green-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-green-500 transition-colors">Contact</a>
            </div>
            
            <p className="text-gray-400 text-center text-sm">
              © 2024 EsyGrab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;