import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import KYCUpload from '@/components/KYCUpload';
import EarningsTransfer from '@/components/EarningsTransfer';
import { 
  ArrowLeft, User, Phone, Mail, Truck, Building, 
  MapPin, Star, CheckCircle, Calendar, Save, FileText, Shield, Wallet
} from 'lucide-react';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Fetch profile data with error handling
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['delivery-profile-details', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      return data || {
        full_name: '',
        phone_number: '',
        vehicle_type: '',
        license_number: '',
        darkstore_id: ''
      };
    },
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch KYC status
  const { data: kycStatus } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('verification_status')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('KYC fetch error:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user
  });

  // Fetch darkstores
  const { data: darkstores } = useQuery({
    queryKey: ['darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkstores')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Darkstores fetch error:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch delivery stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-profile-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        // Get total deliveries
        const { data: totalDeliveries } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('delivery_partner_id', user.id)
          .eq('status', 'delivered');

        // Get this week's deliveries
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const { data: weekDeliveries } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('delivery_partner_id', user.id)
          .eq('status', 'delivered')
          .gte('created_at', weekStart.toISOString());

        const totalEarnings = (totalDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.15), 0);
        const weekEarnings = (weekDeliveries || []).reduce((sum, order) => sum + (Number(order.total_amount) * 0.15), 0);

        return {
          totalDeliveries: totalDeliveries?.length || 0,
          totalEarnings,
          weekDeliveries: weekDeliveries?.length || 0,
          weekEarnings,
          averageRating: 4.7 // Placeholder
        };
      } catch (error) {
        console.error('Stats fetch error:', error);
        return {
          totalDeliveries: 0,
          totalEarnings: 0,
          weekDeliveries: 0,
          weekEarnings: 0,
          averageRating: 0
        };
      }
    },
    enabled: !!user
  });

  // Update form when profile data changes
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      if (!user) throw new Error('No user found');
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile-details'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDarkstoreName = () => {
    if (!profile?.darkstore_id || !darkstores) return 'Not Assigned';
    const darkstore = darkstores.find(d => d.id.toString() === profile.darkstore_id);
    return darkstore ? `${darkstore.name} - ${darkstore.city}` : 'Not Assigned';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h3>
            <p className="text-red-600 mb-4">Unable to load your profile data. Please try again.</p>
            <Button onClick={() => navigate('/delivery-dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/delivery-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-foreground">Delivery Partner Profile</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* KYC Status Alert */}
        {kycStatus?.verification_status !== 'approved' && (
          <div className="mb-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">KYC Verification Required</h3>
                    <p className="text-yellow-700">
                      Complete your KYC verification to start receiving and delivering orders.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold">{stats?.totalDeliveries || 0}</div>
                <p className="text-xs text-muted-foreground">Total Deliveries</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4">
              <div className="text-center">
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold">{stats?.weekDeliveries || 0}</div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4">
              <div className="text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{stats?.averageRating || 0}</div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">Rs</div>
                <div className="text-xl font-bold">{(stats?.totalEarnings || 0).toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">Rs</div>
                <div className="text-xl font-bold">{(stats?.weekEarnings || 0).toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">KYC</span>
              {kycStatus?.verification_status === 'approved' && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader className="border-b border-border/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">{profile?.full_name || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{profile?.phone_number || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      {isEditing ? (
                        <Input
                          id="vehicleType"
                          value={formData.vehicle_type}
                          onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                          placeholder="e.g., Motorcycle, Bicycle, Scooter"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{profile?.vehicle_type || 'Not provided'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="licenseNumber">License/Vehicle Number</Label>
                      {isEditing ? (
                        <Input
                          id="licenseNumber"
                          value={formData.license_number}
                          onChange={(e) => handleInputChange('license_number', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">{profile?.license_number || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="darkstore">Preferred Darkstore</Label>
                      {isEditing ? (
                        <Select value={formData.darkstore_id} onValueChange={(value) => handleInputChange('darkstore_id', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose your preferred darkstore" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Preference</SelectItem>
                            {darkstores?.map((darkstore) => (
                              <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                                {darkstore.name} - {darkstore.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{getDarkstoreName()}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose the darkstore closest to you for easier pickup
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc" className="mt-6">
            <KYCUpload />
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-6">
            <EarningsTransfer 
              totalEarnings={stats?.totalEarnings || 0}
              availableEarnings={stats?.totalEarnings || 0}
            />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">KYC Status</h3>
                      <p className="text-sm text-muted-foreground">Identity verification status</p>
                    </div>
                    <Badge className={
                      kycStatus?.verification_status === 'approved' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : kycStatus?.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }>
                      {kycStatus?.verification_status || 'Not Submitted'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Darkstore Assignment</h3>
                      <p className="text-sm text-muted-foreground">Your assigned pickup location</p>
                    </div>
                    <Badge className={
                      profile?.darkstore_id 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {profile?.darkstore_id ? 'Assigned' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeliveryProfile;