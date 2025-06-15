
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, User, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: '',
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

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch profile info from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      // Get data from "profiles" table based on supabase user id
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number, avatar_url')
        .eq('id', user.id)
        .single();

      // Also get the email from user object
      if (data) {
        setProfile((prev) => ({
          ...prev,
          name: data.full_name || '',
          phone: data.phone_number || '',
          email: user.email ?? '',
          avatar: data.avatar_url || '',
        }));
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Handle updating form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle image input & preview
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Upload image to Supabase storage and get public URL
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    // Create a unique file name
    const fileName = `${user.id}-${Date.now()}`;
    // Upload to "avatars" bucket (create bucket if you don't have one via Supabase console)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: true,
      });
    if (error) {
      alert('Failed to upload avatar.');
      return null;
    }
    // Get public URL
    const { data: publicUrl } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);
    return publicUrl?.publicUrl || null;
  };

  // Update profile in Supabase
  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);

    let avatarUrl = profile.avatar;
    // If user selected a new avatar, upload it
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) avatarUrl = uploadedUrl;
    }

    // Update "profiles" table
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.name,
        phone_number: profile.phone,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    // If user has email changes, update Auth
    if (profile.email && profile.email !== user.email) {
      await supabase.auth.updateUser({ email: profile.email });
    }

    if (!error) {
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      alert('Profile updated successfully!');
    } else {
      alert('Error updating profile.');
    }
    setUpdating(false);
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

            <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <Avatar className="w-24 h-24">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={profile.name || "Avatar"} className="object-cover" />
                    ) : (
                      <AvatarFallback>{profile.name?.slice(0,2).toUpperCase() || "AV"}</AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="avatar-upload">
                    <div className="absolute bottom-1 right-1 bg-gray-200 p-2 rounded-full hover:bg-emerald-500 cursor-pointer shadow transition-colors">
                      <Camera className="w-5 h-5 text-gray-700" />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <span className="text-xs mt-2 text-muted-foreground">Tap to change</span>
              </div>

              {/* Editable Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleUpdateProfile}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </div>

          {/* Addresses (DO NOT CHANGE) */}
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
