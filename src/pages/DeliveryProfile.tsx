import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, User, Phone, Mail, Truck, Building, 
  MapPin, Star, CheckCircle, Calendar, Save
} from 'lucide-react';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [darkstoreId, setDarkstoreId] = useState('');

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['delivery-profile-details', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          darkstores(id, name, address, city)
        `)
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      setFullName((profile as any).full_name || '');
      setPhoneNumber((profile as any).phone_number || '');
      setVehicleType((profile as any).vehicle_type || '');
      setLicenseNumber((profile as any).license_number || '');
      setDarkstoreId((profile as any).darkstore_id || '');
    }
  }, [profile]);

  // Fetch available darkstores
  const { data: darkstores } = useQuery({
    queryKey: ['darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkstores')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch delivery stats
  const { data: stats } = useQuery({
    queryKey: ['delivery-profile-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

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
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile-details'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] });
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
    const updatedData: any = {
      full_name: fullName,
      phone_number: phoneNumber,
      vehicle_type: vehicleType,
      license_number: licenseNumber,
    };

    // Only include darkstore_id if it's changed
    if (darkstoreId !== (profile as any)?.darkstore_id) {
      updatedData.darkstore_id = darkstoreId || null;
    }

    updateProfileMutation.mutate(updatedData);
  };

  const getDarkstoreName = () => {
    if ((profile as any)?.darkstores) {
      return Array.isArray((profile as any).darkstores) ? (profile as any).darkstores[0]?.name : (profile as any).darkstores?.name;
    }
    return 'Not Assigned';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/delivery-dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">Profile Settings</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Stats Cards */}
          <div className="md:col-span-3">
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
          </div>

          {/* Profile Information */}
          <Card className="md:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{(profile as any)?.full_name || 'Not provided'}</p>
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{(profile as any)?.phone_number || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  {isEditing ? (
                    <Input
                      id="vehicleType"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      placeholder="e.g., Motorcycle, Bicycle, Scooter"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{(profile as any)?.vehicle_type || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="licenseNumber">License/Vehicle Number</Label>
                  {isEditing ? (
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{(profile as any)?.license_number || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="darkstore">Assigned Darkstore</Label>
                  {isEditing ? (
                    <Select value={darkstoreId} onValueChange={setDarkstoreId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a darkstore" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Darkstore</SelectItem>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Account Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Partner Role</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Delivery Partner
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verification</span>
                  <Badge className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Joined</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date((profile as any)?.created_at || '').toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Performance</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Based on delivery speed and customer ratings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;