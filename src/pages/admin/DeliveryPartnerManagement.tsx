import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw, Eye, UserX, FileText, Phone, MapPin, Car, Hash } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const DeliveryPartnerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveryPartners = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          kyc_verifications!kyc_verifications_user_id_fkey(
            verification_status,
            citizenship_document_url,
            license_document_url,
            pan_document_url,
            submitted_at
          )
        `)
        .eq('role', 'delivery_partner')
        .eq('kyc_verified', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: darkstores = [] } = useQuery({
    queryKey: ['darkstores-for-partners'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_darkstores');
      if (error) throw error;
      return data;
    }
  });

  const revokePartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      // Update KYC status to rejected
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({ 
          verification_status: 'rejected',
          admin_comments: 'Access revoked by admin'
        })
        .eq('user_id', partnerId);

      if (kycError) throw kycError;

      // Update profile to not verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          kyc_verified: false,
          is_online: false
        })
        .eq('id', partnerId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-partners'] });
      toast({
        title: "Success",
        description: "Delivery partner access has been revoked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to revoke delivery partner access.",
        variant: "destructive",
      });
    }
  });

  const filteredPartners = deliveryPartners.filter(partner => 
    partner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone_number?.includes(searchTerm) ||
    partner.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
    setDetailsModalOpen(true);
  };

  const getDarkstoreName = (darkstoreId: string) => {
    const darkstore = darkstores.find((ds: any) => ds.id.toString() === darkstoreId);
    return darkstore ? `${darkstore.name} - ${darkstore.address}` : 'Not assigned';
  };

  const openDocument = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Delivery Partner Management</h1>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search delivery partners by name, phone, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading delivery partners...</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Phone</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Vehicle</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">License</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Darkstore</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="font-medium">{partner.full_name || 'Unknown Partner'}</div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {partner.phone_number || 'Not provided'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {partner.vehicle_type || 'Not specified'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {partner.license_number || 'Not provided'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-sm">{getDarkstoreName(partner.darkstore_id)}</div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-green-600 border-green-200 w-fit">
                          Verified
                        </Badge>
                        {partner.is_online && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200 w-fit">
                            Online
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(partner)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokePartnerMutation.mutate(partner.id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Partner Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery Partner Details</DialogTitle>
            </DialogHeader>
            
            {selectedPartner && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Personal Information</h4>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedPartner.full_name || 'Not provided'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{selectedPartner.phone_number || 'Not provided'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Vehicle Type</p>
                      <p className="font-medium">{selectedPartner.vehicle_type || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">License Number</p>
                      <p className="font-medium">{selectedPartner.license_number || 'Not provided'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Assigned Darkstore</p>
                      <p className="font-medium">{getDarkstoreName(selectedPartner.darkstore_id)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex gap-2">
                        {selectedPartner.kyc_verified && (
                          <Badge variant="outline" className="text-green-600">KYC Verified</Badge>
                        )}
                        {selectedPartner.is_online && (
                          <Badge variant="outline" className="text-blue-600">Online</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">KYC Documents</h4>
                    
                    {selectedPartner.kyc_verifications?.[0] ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(selectedPartner.kyc_verifications[0].submitted_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: <Badge variant="outline" className="text-green-600">
                              {selectedPartner.kyc_verifications[0].verification_status}
                            </Badge>
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {selectedPartner.kyc_verifications[0].citizenship_document_url && (
                            <Button
                              variant="outline"
                              onClick={() => openDocument(selectedPartner.kyc_verifications[0].citizenship_document_url)}
                              className="justify-start"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Citizenship Document
                            </Button>
                          )}
                          
                          {selectedPartner.kyc_verifications[0].license_document_url && (
                            <Button
                              variant="outline"
                              onClick={() => openDocument(selectedPartner.kyc_verifications[0].license_document_url)}
                              className="justify-start"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View License Document
                            </Button>
                          )}
                          
                          {selectedPartner.kyc_verifications[0].pan_document_url && (
                            <Button
                              variant="outline"
                              onClick={() => openDocument(selectedPartner.kyc_verifications[0].pan_document_url)}
                              className="justify-start"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View PAN Document
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No KYC documents found</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      revokePartnerMutation.mutate(selectedPartner.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Revoke Access
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default DeliveryPartnerManagement;