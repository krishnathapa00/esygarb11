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
import EditAddressModal from '../components/EditAddressModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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
        id: "1",
        type: "Home",
        address: "123 Main St, Apartment 4B",
        city: "New York",
        state: "NY",
        pincode: "10001",
        default: true,
      },
      {
        id: "2",
        type: "Work",
        address: "456 Office Blvd, Suite 100",
        city: "New York",
        state: "NY",
        pincode: "10002",
        default: false,
      },
    ],
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

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

  // Fetch addresses from Supabase on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      setLoadingAddresses(true);
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Failed to fetch addresses",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAddresses(data || []);
      }
      setLoadingAddresses(false);
    };

    fetchAddresses();
  }, [user]);

  // Add new address (opens map location page as per old logic)
  const handleAddNewAddress = () => {
    // For now, redirect to /map-location as before.
    // If you want a modal/form, let me know!
  };

  // Edit Address modal logic
  const handleEditClick = (address: any) => {
    setEditAddress(address);
    setEditModalOpen(true);
  };

  const handleSaveAddress = async (updated: any) => {
    if (!user) return;
    // Update in Supabase
    const { error } = await supabase
      .from("addresses")
      .update({
        ...updated,
      })
      .eq("id", updated.id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error updating address",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === updated.id ? { ...updated } : addr))
    );
    setEditModalOpen(false);
    toast({
      title: "Address updated",
      description: "Your address has been updated.",
    });
  };

  // Delete Address logic
  const handleDeleteClick = (id: string) => {
    setDeleteAddressId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteAddressId) return;
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", deleteAddressId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error deleting address",
        description: error.message,
        variant: "destructive",
      });
      setDeleteModalOpen(false);
      return;
    }
    setAddresses(prev => prev.filter(addr => addr.id !== deleteAddressId));
    setDeleteModalOpen(false);
    toast({
      title: "Address deleted",
      description: "Your address was deleted successfully.",
    });
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
          {/* Redesigned Personal Information (Modern Card) */}
          <div className="bg-white rounded-xl p-0 shadow-sm border">
            <div className="h-28 w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl relative">
              <div className="absolute left-1/2 -bottom-16 -translate-x-1/2 flex flex-col items-center w-full">
                <div className="relative w-32 h-32">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-md ring-4 ring-emerald-100 bg-muted">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={profile.name || "Avatar"} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-3xl">
                        {profile.name?.slice(0,2).toUpperCase() || "AV"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="avatar-upload">
                    <div className="absolute bottom-1 right-1 bg-white p-3 rounded-full hover:bg-emerald-500 cursor-pointer shadow-md border border-gray-200 transition-colors">
                      <Camera className="w-6 h-6 text-emerald-700 hover:text-white" />
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
                <span className="text-xs mt-2 text-muted-foreground">Change photo</span>
              </div>
            </div>
            <div className="pt-20 pb-8 px-5 md:px-12">
              <div className="flex flex-col items-center gap-1 mt-2 mb-8">
                <User className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold">{profile.name || "Your Name"}</h3>
                <span className="text-sm text-muted-foreground">{profile.email ? profile.email : "No email"}</span>
              </div>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
                onSubmit={e => { e.preventDefault(); handleUpdateProfile(); }}
              >
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={profile.name}
                    onChange={handleChange}
                    className="outline-none border-2 border-emerald-100 focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={profile.phone}
                    onChange={handleChange}
                    className="outline-none border-2 border-emerald-100 focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={profile.email}
                    onChange={handleChange}
                    className="outline-none border-2 border-emerald-100 focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-2 font-semibold text-lg shadow transition-colors"
                    disabled={updating}
                    type="submit"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4.5 8-10V7a8 8 0 10-16 0v5C4 17.5 12 22 12 22z" /><circle cx="12" cy="11" r="3" /></svg>
                <h3 className="text-lg font-semibold">My Addresses</h3>
              </div>
              <Link to="/map-location">
                <Button variant="outline" size="sm">
                  Add New Address
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loadingAddresses ? (
                <div>Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-muted-foreground">No addresses found.</div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border p-4 rounded-lg ${address.is_default ? 'bg-green-50 border-green-200' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{address.type || "Address"}</span>
                        {address.is_default && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(address)}>Edit</Button>
                        {!address.is_default && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(address.id)}>Delete</Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-gray-600">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zip_code}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Address Edit & Delete Modals (pass single address object) */}
          <EditAddressModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveAddress}
            address={editAddress}
          />
          <ConfirmDeleteModal
            isOpen={deleteModalOpen}
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            itemName="this address"
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
