
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Car, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    vehicle_type: '',
    license_number: '',
    darkstore_id: ''
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: darkstores = [] } = useQuery({
    queryKey: ['darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkstores')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: kycStatus } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('verification_status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0]?.verification_status || null;
    },
    enabled: !!user?.id
  });

  const { data: earnings = [] } = useQuery({
    queryKey: ['delivery-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select(`
          *,
          orders!delivery_earnings_order_id_fkey(
            order_number,
            created_at,
            total_amount
          )
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
    return darkstores.find(ds => ds.id.toString() === formData.darkstore_id);
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount?.toString() || '0'), 0);

  const getKYCStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />KYC Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />KYC Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />KYC Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600"><AlertCircle className="w-3 h-3 mr-1" />KYC Required</Badge>;
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  const isSetupComplete = profile?.kyc_verified && profile?.darkstore_id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Delivery Partner Profile</h1>
          {getKYCStatusBadge()}
        </div>

        {!isSetupComplete && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Account setup required</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please complete your profile and KYC verification to start receiving orders.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.phone_number || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vehicle Type</label>
                  {isEditing ? (
                    <Select value={formData.vehicle_type} onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.vehicle_type || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">License Number</label>
                  {isEditing ? (
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="Enter license number"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.license_number || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Assigned Darkstore</label>
                {isEditing ? (
                  <Select value={formData.darkstore_id} onValueChange={(value) => setFormData({ ...formData, darkstore_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select darkstore" />
                    </SelectTrigger>
                    <SelectContent>
                      {darkstores.map((darkstore) => (
                        <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                          {darkstore.name} - {darkstore.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {getSelectedDarkstore()?.name || 'Not assigned'}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-700">₹{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-blue-700">{earnings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings.length > 0 ? (
                earnings.slice(0, 10).map((earning) => (
                  <div key={earning.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Order #{earning.orders?.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(earning.amount?.toString() || '0').toFixed(2)}</p>
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
