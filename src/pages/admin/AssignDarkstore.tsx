import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, User, Building } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const AssignDarkstore = () => {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedDarkstore, setSelectedDarkstore] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveryPartners = [] } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
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
      setSelectedPartner('');
      setSelectedDarkstore('');
      toast({
        title: "Darkstore Assigned",
        description: "Delivery partner has been assigned to the darkstore successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign darkstore to delivery partner.",
        variant: "destructive",
      });
    }
  });

  const handleAssign = () => {
    if (selectedPartner && selectedDarkstore) {
      assignDarkstoreMutation.mutate({
        partnerId: selectedPartner,
        darkstoreId: selectedDarkstore
      });
    }
  };

  const getPartnerStatus = (partner: any) => {
    if (!partner.kyc_verified) {
      return <Badge variant="destructive">KYC Pending</Badge>;
    }
    if (!partner.darkstore_id) {
      return <Badge variant="outline" className="text-warning">No Darkstore</Badge>;
    }
    return <Badge variant="outline" className="text-success">Active</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Assign Darkstores</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Quick Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Delivery Partner</label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a delivery partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPartners
                      .filter(p => p.kyc_verified && !p.darkstore_id)
                      .map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.full_name} - {partner.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Darkstore</label>
                <Select value={selectedDarkstore} onValueChange={setSelectedDarkstore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a darkstore" />
                  </SelectTrigger>
                  <SelectContent>
                    {darkstores.map((darkstore) => (
                      <SelectItem key={darkstore.id.toString()} value={darkstore.id.toString()}>
                        {darkstore.name} - {darkstore.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAssign}
              disabled={!selectedPartner || !selectedDarkstore || assignDarkstoreMutation.isPending}
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Assign Darkstore
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Delivery Partners</h2>
          <div className="grid gap-4">
            {deliveryPartners.map((partner) => {
              const assignedDarkstore = darkstores.find(d => d.id.toString() === partner.darkstore_id);
              
              return (
                <Card key={partner.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5" />
                          <h3 className="font-semibold">{partner.full_name}</h3>
                          {getPartnerStatus(partner)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Phone: {partner.phone_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vehicle: {partner.vehicle_type || 'Not specified'}
                        </p>
                        {assignedDarkstore && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm font-medium">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              Assigned to: {assignedDarkstore.name}, {assignedDarkstore.city}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {partner.kyc_verified && !partner.darkstore_id && (
                        <div className="flex flex-col gap-2">
                          <Select
                            onValueChange={(value) => {
                              assignDarkstoreMutation.mutate({
                                partnerId: partner.id,
                                darkstoreId: value
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign Darkstore" />
                            </SelectTrigger>
                            <SelectContent>
                              {darkstores.map((darkstore) => (
                                <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                                  {darkstore.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignDarkstore;
