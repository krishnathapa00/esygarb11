
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import PaymentGateway from '../components/PaymentGateway';
import { ArrowLeft, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: ''
  });

  const totalAmount = 160;

  useEffect(() => {
    // Auto-fill from profile data (simulated - in real app this would come from database/context)
    const profileData = {
      fullName: 'John Doe',
      phone: '+977 9876543210'
    };
    
    setFormData(prev => ({
      ...prev,
      fullName: profileData.fullName,
      phone: profileData.phone
    }));

    // Auto-fill location from previous detection
    const savedLocation = localStorage.getItem('esygrab_user_location');
    if (savedLocation && savedLocation !== 'Current Location Detected') {
      const savedLocationData = JSON.parse(savedLocation || '{}');
      if (savedLocationData.address) {
        setFormData(prev => ({
          ...prev,
          address: savedLocationData.address,
          city: savedLocationData.city || '',
          state: savedLocationData.state || '',
          pincode: savedLocationData.pincode || ''
        }));
      }
    }
  }, []);

  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simulate a successful geocoding response
            const locationData = {
              address: 'Thamel, Kathmandu',
              city: 'Kathmandu',
              state: 'Bagmati',
              pincode: '44600',
              formatted: 'Thamel, Kathmandu, Bagmati 44600'
            };

            setFormData(prev => ({
              ...prev,
              address: locationData.address,
              city: locationData.city,
              state: locationData.state,
              pincode: locationData.pincode
            }));

            // Save to localStorage
            localStorage.setItem('esygrab_user_location', JSON.stringify(locationData));
            
          } catch (error) {
            console.log('Using fallback location');
            const fallbackData = {
              address: 'Current location detected',
              city: 'Kathmandu',
              state: 'Bagmati',
              pincode: ''
            };
            setFormData(prev => ({ ...prev, ...fallbackData }));
          }
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
      console.log('Geolocation not supported');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    // Redirect to order confirmation
    window.location.href = '/order-confirmation';
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
    setShowPaymentGateway(false);
  };

  const handlePlaceOrder = () => {
    if (selectedPayment === 'cod') {
      // Direct to order confirmation for COD
      window.location.href = '/order-confirmation';
    } else {
      // Show payment gateway for digital payments
      setShowPaymentGateway(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={3}
        onCartClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Delivery Address</h3>
                </div>
                <Button
                  onClick={detectCurrentLocation}
                  disabled={isDetectingLocation}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-1" />
                      Auto-Detect
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input 
                    id="pincode" 
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Input 
                    id="address" 
                    placeholder="House no, Building, Street, Area"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input 
                    id="state" 
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Payment Method</h3>
              </div>
              
              {!showPaymentGateway ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === 'cod'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-green-600"
                    />
                    <label htmlFor="cod" className="text-sm font-medium">
                      Cash on Delivery (COD)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="digital"
                      name="payment"
                      value="digital"
                      checked={selectedPayment === 'digital'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-green-600"
                    />
                    <label htmlFor="digital" className="text-sm font-medium">
                      Digital Payment (eSewa, Khalti)
                    </label>
                  </div>
                </div>
              ) : (
                <PaymentGateway
                  amount={totalAmount}
                  orderId="ORD123456789"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal (3 items)</span>
                <span>Rs 140</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>Rs 20</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePlaceOrder}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {selectedPayment === 'cod' ? 'Place Order' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
