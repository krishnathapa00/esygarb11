
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Truck, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CartPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    deliveryLocation: ''
  });

  // Load user info from localStorage
  useEffect(() => {
    // Get user profile info
    const savedProfile = localStorage.getItem('esygrab_user_profile');
    const savedLocation = localStorage.getItem('esygrab_user_location');
    
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserInfo(prev => ({
          ...prev,
          name: profile.name || 'John Doe',
          phone: profile.phone || '+1 555-123-4567'
        }));
      } catch (error) {
        console.error('Error parsing profile:', error);
        setUserInfo(prev => ({
          ...prev,
          name: 'John Doe',
          phone: '+1 555-123-4567'
        }));
      }
    } else {
      setUserInfo(prev => ({
        ...prev,
        name: 'John Doe',
        phone: '+1 555-123-4567'
      }));
    }

    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserInfo(prev => ({
          ...prev,
          deliveryLocation: location.address || 'Current Location'
        }));
      } catch (error) {
        console.error('Error parsing location:', error);
        setUserInfo(prev => ({
          ...prev,
          deliveryLocation: 'Set delivery location'
        }));
      }
    } else {
      setUserInfo(prev => ({
        ...prev,
        deliveryLocation: 'Set delivery location'
      }));
    }
  }, []);

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: "Fresh Bananas",
      price: 40,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      weight: "1 kg",
      quantity: 2
    },
    {
      id: 2,
      name: "Fresh Milk",
      price: 60,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
      weight: "1 L",
      quantity: 1
    },
  ];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = totalPrice > 200 ? 0 : 20;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={totalItems}
        onCartClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Cart ({totalItems} items)</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Delivery in 10-15 mins
                </span>
              </div>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.weight}</p>
                    <p className="font-semibold text-green-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Delivery Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Delivery Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input 
                      id="address"
                      value={userInfo.deliveryLocation}
                      onChange={(e) => setUserInfo({...userInfo, deliveryLocation: e.target.value})}
                      className="flex-1"
                    />
                    <Link to="/map-location">
                      <Button variant="outline" size="sm" className="px-3">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              {deliveryFee === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Free delivery on orders above ₹200
                </Badge>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Delivery in 10-15 mins</span>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
