import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Clock, User, Phone, MapPin, FileText, Eye, UserCheck, UserX } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const DeliveryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch delivery partners with KYC data
  const { data: deliveryPartners = [], isLoading } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders!orders_delivery_partner_id_fkey(id, status, created_at),
          kyc_verifications!kyc_verifications_user_id_fkey(
            id,
            verification_status,
            citizenship_document_url,
            license_document_url,
            pan_document_url,
            admin_comments,
            submitted_at,
            reviewed_at
          )
        `)
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching delivery partners",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    }
  });

  // Update partner status mutation
  const updatePartnerStatus = useMutation({
    mutationFn: async ({ partnerId, role }: { partnerId: string; role: 'delivery_partner' | 'customer' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      toast({
        title: "Status updated",
        description: "Delivery partner status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update KYC status mutation
  const updateKYCMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments: string }) => {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          verification_status: status,
          admin_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      setReviewModalOpen(false);
      toast({
        title: "KYC Updated",
        description: "KYC verification status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update KYC verification.",
        variant: "destructive",
      });
    }
  });

  const filteredPartners = deliveryPartners.filter(partner =>
    partner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (role: string) => {
    switch (role) {
      case 'delivery_partner':
        return 'bg-green-100 text-green-700';
      case 'customer':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStats = (orders: any[]) => {
    if (!orders) return { total: 0, completed: 0, pending: 0 };
    
    const total = orders.length;
    const completed = orders.filter(order => order.status === 'delivered').length;
    const pending = orders.filter(order => 
      ['confirmed', 'dispatched', 'out_for_delivery'].includes(order.status)
    ).length;
    
    return { total, completed, pending };
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">Pending Review</Badge>;
      case 'approved':
        return <Badge className="text-green-700 bg-green-50 border-green-200">KYC Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">KYC Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-700">No KYC</Badge>;
    }
  };

  const handleReviewKYC = (partner: any) => {
    const kyc = partner.kyc_verifications[0];
    if (kyc) {
      setSelectedKYC({...kyc, partner_name: partner.full_name});
      setAdminComments(kyc.admin_comments || '');
      setReviewModalOpen(true);
    }
  };

  const handleApproveKYC = () => {
    if (selectedKYC) {
      updateKYCMutation.mutate({
        id: selectedKYC.id,
        status: 'approved',
        comments: adminComments
      });
    }
  };

  const handleRejectKYC = () => {
    if (selectedKYC) {
      updateKYCMutation.mutate({
        id: selectedKYC.id,
        status: 'rejected',
        comments: adminComments
      });
    }
  };

  const openDocument = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Delivery Partners</h1>
            <p className="text-gray-500">Manage delivery partner registrations and status</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Partner Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading delivery partners...</p>
              </div>
            ) : filteredPartners.length > 0 ? (
              <div className="space-y-4">
                {filteredPartners.map((partner) => {
                  const orderStats = getOrderStats(partner.orders);
                  return (
                    <div key={partner.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-600" />
                            <h3 className="font-semibold text-lg">{partner.full_name || 'Unnamed Partner'}</h3>
                            <Badge className={getStatusColor(partner.role)}>
                              {partner.role === 'delivery_partner' ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{partner.phone_number || 'No phone'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{partner.location || 'No location'}</span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Vehicle:</span> {partner.vehicle_type || 'Not specified'}
                            </div>
                          </div>

                          {/* KYC Status Section */}
                          <div className="border-t pt-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">KYC Status:</span>
                              {partner.kyc_verifications?.[0] 
                                ? getKYCStatusBadge(partner.kyc_verifications[0].verification_status)
                                : getKYCStatusBadge('none')
                              }
                            </div>
                            
                            {partner.kyc_verifications?.[0] && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {partner.kyc_verifications[0].citizenship_document_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDocument(partner.kyc_verifications[0].citizenship_document_url)}
                                    className="h-7 text-xs"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    Citizenship
                                  </Button>
                                )}
                                {partner.kyc_verifications[0].license_document_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDocument(partner.kyc_verifications[0].license_document_url)}
                                    className="h-7 text-xs"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    License
                                  </Button>
                                )}
                                {partner.kyc_verifications[0].pan_document_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDocument(partner.kyc_verifications[0].pan_document_url)}
                                    className="h-7 text-xs"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    PAN
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {partner.license_number && (
                            <div className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">License:</span> {partner.license_number}
                            </div>
                          )}

                          <div className="flex space-x-6 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Total Orders:</span>
                              <span className="ml-2 font-semibold">{orderStats.total}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Completed:</span>
                              <span className="ml-2 font-semibold text-green-600">{orderStats.completed}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Pending:</span>
                              <span className="ml-2 font-semibold text-orange-600">{orderStats.pending}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {/* KYC Review Button */}
                          {partner.kyc_verifications?.[0]?.verification_status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleReviewKYC(partner)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review KYC
                            </Button>
                          )}
                          
                          {/* Partner Approval/Revoke */}
                          {partner.role === 'customer' ? (
                            <Button
                              size="sm"
                              onClick={() => updatePartnerStatus.mutate({ 
                                partnerId: partner.id, 
                                role: 'delivery_partner' 
                              })}
                              disabled={updatePartnerStatus.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updatePartnerStatus.mutate({ 
                                partnerId: partner.id, 
                                role: 'customer' 
                              })}
                              disabled={updatePartnerStatus.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                          
                          <div className="text-xs text-gray-500 text-center">
                            Joined: {new Date(partner.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No delivery partners found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Review Modal */}
        <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review KYC Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Partner: {selectedKYC?.partner_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Submitted: {selectedKYC?.submitted_at ? new Date(selectedKYC.submitted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Document Links */}
              <div className="grid grid-cols-3 gap-2">
                {selectedKYC?.citizenship_document_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(selectedKYC.citizenship_document_url)}
                    className="text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Citizenship
                  </Button>
                )}
                {selectedKYC?.license_document_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(selectedKYC.license_document_url)}
                    className="text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    License
                  </Button>
                )}
                {selectedKYC?.pan_document_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(selectedKYC.pan_document_url)}
                    className="text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    PAN
                  </Button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Admin Comments</label>
                <Textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Add comments about the verification..."
                  className="min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApproveKYC}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={updateKYCMutation.isPending}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={handleRejectKYC}
                  variant="destructive"
                  className="flex-1"
                  disabled={updateKYCMutation.isPending}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default DeliveryList;