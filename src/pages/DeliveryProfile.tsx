import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Edit, Save, X, CheckCircle, AlertCircle, DollarSign, Package, ArrowLeft } from 'lucide-react';
import KYCSubmission from '@/components/KYCSubmission';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    vehicle_type: '',
    license_number: '',
    darkstore_id: ''
  });

  // Fetch delivery partner profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('No user ID available');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
    retry: 3
  });

  // Fetch available darkstores
  const { data: darkstores = [] } = useQuery({
    queryKey: ['available-darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_darkstores');
      if (error) throw error;
      return data;
    }
  });

  // Fetch KYC status
  const { data: kycStatus } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('verification_status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.verification_status || 'not_submitted';
    },
    enabled: !!user?.id
  });

  // Fetch earnings
  const { data: earnings = [] } = useQuery({
    queryKey: ['delivery-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select(`
          *,
          orders(order_number, created_at)
        `)
        .eq('delivery_partner_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile', user?.id] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        vehicle_type: profile.vehicle_type || '',
        license_number: profile.license_number || '',
        darkstore_id: profile.darkstore_id || ''
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const getSelectedDarkstore = () => {
    return darkstores.find((ds: any) => ds.id.toString() === formData.darkstore_id);
  };

  const totalEarnings = earnings.reduce((sum: number, earning: any) => sum + parseFloat(earning.amount), 0);

  const getKYCStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />KYC Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />KYC Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />KYC Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600"><AlertCircle className="w-3 h-3 mr-1" />KYC Not Submitted</Badge>;
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load profile</p>
            <Button onClick={() => navigate('/delivery-partner/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isProfileComplete = profile?.full_name && profile?.phone_number && profile?.vehicle_type && profile?.license_number && profile?.darkstore_id;
  const isKYCApproved = kycStatus === 'approved';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/delivery-partner/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Delivery Partner Profile</h1>
          </div>
          {getKYCStatusBadge()}
        </div>

        {/* Warning if setup incomplete - only show if KYC not approved */}
        {(!isProfileComplete || kycStatus !== 'approved') && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Account Setup Required</p>
                  <p className="text-sm text-yellow-700">
                    Please complete your profile and KYC verification to start receiving delivery requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Verification Section - Only show if not approved */}
        {kycStatus !== 'approved' && (
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload required documents for identity verification
              </p>
            </CardHeader>
            <CardContent>
              <KYCSubmission />
            </CardContent>
          </Card>
        )}

        {/* KYC Status Display for Approved Users */}
        {kycStatus === 'approved' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                KYC Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your account is verified and ready for deliveries
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  // Navigate to view KYC details
                  toast({
                    title: "KYC Documents",
                    description: "Your documents have been approved and verified.",
                  });
                }}
              >
                View Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="scooter">Scooter</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="cycle">Cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="darkstore">Assigned Darkstore</Label>
                  <Select
                    value={formData.darkstore_id}
                    onValueChange={(value) => setFormData({ ...formData, darkstore_id: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Darkstore" />
                    </SelectTrigger>
                    <SelectContent>
                      {darkstores?.map((darkstore: any) => (
                        <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                          {darkstore.name} - {darkstore.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile?.full_name || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{profile?.phone_number || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium">{profile?.vehicle_type || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{profile?.license_number || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Darkstore</p>
                  <p className="font-medium">
                    {getSelectedDarkstore()?.name || 'Not assigned'}
                  </p>
                  {getSelectedDarkstore() && (
                    <p className="text-sm text-muted-foreground">
                      {getSelectedDarkstore()?.address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">Rs {totalEarnings.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold text-blue-600">{earnings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.length > 0 ? (
                earnings.slice(0, 10).map((earning: any) => (
                  <div key={earning.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Order #{earning.orders?.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs {parseFloat(String(earning.amount || '0')).toFixed(2)}</p>
                      {earning.delivery_time_minutes && (
                        <p className="text-sm text-muted-foreground">
                          {earning.delivery_time_minutes} mins
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No earnings yet. Complete your first delivery to see earnings here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryProfile;