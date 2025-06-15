import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const UserProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItems={0}
        onCartClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />
      
      <div className="max-w-xl mx-auto px-4 py-8 bg-white rounded-lg shadow-sm mt-8">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>
        <div className="flex flex-col space-y-2">
          <span><strong>User ID:</strong> {user.id}</span>
          <span><strong>Email:</strong> {user.email || "N/A"}</span>
          <span><strong>Phone:</strong> {user.phone || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
