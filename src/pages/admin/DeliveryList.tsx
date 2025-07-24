import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const DeliveryList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedDarkstore, setSelectedDarkstore] = useState('');

  // Fetch delivery partners
  const { data: deliveryPartners = [], isLoading: loadingPartners, refetch } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, phone_number, vehicle_type, license_number, 
          darkstore_id, kyc_verified, is_online, created_at
        `)
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch darkstores
  const { data: darkstores = [] } = useQuery({
    queryKey: ['darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkstores')
        .select('id, name, address, city')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Assign darkstore mutation
  const assignDarkstoreMutation = useMutation({
    mutationFn: async ({ partnerId, darkstoreId }: { partnerId: string; darkstoreId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ darkstore_id: darkstoreId })
        .eq('id', partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      toast({
        title: "Success",
        description: "Darkstore assigned successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign darkstore.",
        variant: "destructive",
      });
    }
  });

  const handleQuickAssign = () => {
    if (!selectedPartner || !selectedDarkstore) {
      toast({
        title: "Selection Required",
        description: "Please select both partner and darkstore to assign",
        variant: "destructive",
      });
      return;
    }

    assignDarkstoreMutation.mutate({
      partnerId: selectedPartner,
      darkstoreId: selectedDarkstore
    });

    setSelectedPartner('');
    setSelectedDarkstore('');
  };

  const getPartnerStatus = (partner: any) => {
    if (!partner.kyc_verified) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />KYC Pending</Badge>;
    }
    if (!partner.darkstore_id) {
      return <Badge variant="outline">No Darkstore</Badge>;
    }
    return <Badge variant="default" className="bg-green-500"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>;
  };

  const getDarkstoreName = (darkstoreId: string) => {
    if (!darkstoreId) return 'Not Assigned';
    const darkstore = darkstores.find(ds => ds.id.toString() === darkstoreId);
    return darkstore ? `${darkstore.name} - ${darkstore.city}` : 'Not Assigned';
  };

  if (loadingPartners) {
    return (
      <AdminLayout>
        <div>Loading delivery partners...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
          <Button onClick={() => refetch()} disabled={loadingPartners}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Assignment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Darkstore Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Partner" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners
                    .filter(partner => partner.kyc_verified)
                    .map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedDarkstore} onValueChange={setSelectedDarkstore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Darkstore" />
                </SelectTrigger>
                <SelectContent>
                  {darkstores.map((darkstore) => (
                    <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                      {darkstore.name} - {darkstore.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleQuickAssign}
                disabled={assignDarkstoreMutation.isPending || !selectedPartner || !selectedDarkstore}
              >
                {assignDarkstoreMutation.isPending ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Partners List */}
        <div className="space-y-4">
          {deliveryPartners.map((partner) => (
            <Card key={partner.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{partner.full_name}</h3>
                      {getPartnerStatus(partner)}
                      {partner.is_online && (
                        <Badge variant="outline" className="text-green-600">Online</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Phone: {partner.phone_number || 'Not provided'}</p>
                      <p>Vehicle: {partner.vehicle_type || 'Not specified'}</p>
                      <p>License: {partner.license_number || 'Not provided'}</p>
                      <p>Darkstore: {getDarkstoreName(partner.darkstore_id)}</p>
                    </div>
                  </div>

                  {partner.kyc_verified && (
                    <div className="space-y-2">
                      <Select
                        value={partner.darkstore_id || ''}
                        onValueChange={(value) => 
                          assignDarkstoreMutation.mutate({
                            partnerId: partner.id,
                            darkstoreId: value
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assign Darkstore" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Assignment</SelectItem>
                          {darkstores.map((darkstore) => (
                            <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                              {darkstore.name} - {darkstore.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {deliveryPartners.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No delivery partners found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DeliveryList;