
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+1 555-123-4567",
    email: "john@example.com",
    addresses: [
      {
        id: 1,
        type: "Home",
        address: "123 Main St, Apartment 4B",
        city: "New York",
        state: "NY",
        pincode: "10001",
        default: true,
      },
      {
        id: 2,
        type: "Work",
        address: "456 Office Blvd, Suite 100",
        city: "New York",
        state: "NY",
        pincode: "10002",
        default: false,
      },
    ],
  });

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('esygrab_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
  }, []);

  const handleUpdateProfile = () => {
    // Save profile to localStorage
    localStorage.setItem('esygrab_user_profile', JSON.stringify({
      name: profile.name,
      phone: profile.phone,
      email: profile.email
    }));
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={0}
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={handleUpdateProfile}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Update Profile
              </Button>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">My Addresses</h3>
              </div>
              <Link to="/map-location">
                <Button variant="outline" size="sm">
                  Add New Address
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {profile.addresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`border p-4 rounded-lg ${address.default ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{address.type}</span>
                      {address.default && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      {!address.default && <Button variant="ghost" size="sm">Delete</Button>}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-gray-600">
                    <p>{address.address}</p>
                    <p>{address.city}, {address.state} {address.pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
