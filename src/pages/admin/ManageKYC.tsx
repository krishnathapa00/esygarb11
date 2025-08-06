
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText, UserCheck, UserX, Trash2, Phone } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const ManageKYC = () => {
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kycVerifications = [], isLoading } = useQuery({
    queryKey: ['admin-kyc-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles!kyc_verifications_user_id_fkey(
            full_name,
            phone_number,
            role
          )
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateKYCMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          verification_status: status,
          admin_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;

      // Update profile kyc_verified status
      if (status === 'approved') {
        await supabase
          .from('profiles')
          .update({ kyc_verified: true })
          .eq('id', selectedKYC.user_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      setReviewModalOpen(false);
      toast({
        title: "KYC Updated",
        description: "KYC verification status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update KYC verification.",
        variant: "destructive",
      });
    }
  });

  const deleteKYCMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kyc_verifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      toast({
        title: "KYC Deleted",
        description: "KYC verification has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete KYC verification.",
        variant: "destructive",
      });
    }
  });

  const handleReview = (kyc: any) => {
    setSelectedKYC(kyc);
    setAdminComments(kyc.admin_comments || '');
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedKYC) {
      updateKYCMutation.mutate({
        id: selectedKYC.id,
        status: 'approved',
        comments: adminComments
      });
    }
  };

  const handleReject = () => {
    if (selectedKYC) {
      updateKYCMutation.mutate({
        id: selectedKYC.id,
        status: 'rejected',
        comments: adminComments
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const openDocument = async (url: string) => {
    if (url) {
      try {
        // Create signed URL for viewing
        const { data: signedUrlData, error } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(url, 3600); // 1 hour expiry

        if (error) throw error;
        window.open(signedUrlData.signedUrl, '_blank');
      } catch (error) {
        console.error('Error viewing document:', error);
        toast({
          title: "Error",
          description: "Failed to open document",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">KYC Verifications</h1>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading KYC verifications...</p>
              </div>
            </div>
          ) : kycVerifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No KYC submissions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                KYC submissions from delivery partners will appear here
              </p>
            </div>
          ) : (
            kycVerifications.map((kyc) => (
              <Card key={kyc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{kyc.profiles?.full_name || 'Unknown User'}</h3>
                      {getStatusBadge(kyc.verification_status)}
                      <Badge variant="outline" className="text-blue-600">{kyc.profiles?.role || 'Unknown'}</Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-muted-foreground">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Phone: {kyc.profiles?.phone_number || 'Not provided'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(kyc.submitted_at).toLocaleDateString()} at {new Date(kyc.submitted_at).toLocaleTimeString()}
                      </p>
                      {kyc.reviewed_at && (
                        <p className="text-sm text-muted-foreground">
                          Reviewed: {new Date(kyc.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {kyc.admin_comments && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">
                          <strong className="text-blue-800">Admin Comments:</strong>
                          <span className="ml-2 text-blue-700">{kyc.admin_comments}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex flex-wrap gap-2">
                      {kyc.citizenship_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.citizenship_document_url)}
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Citizenship
                        </Button>
                      )}
                      {kyc.license_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.license_document_url)}
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          License
                        </Button>
                      )}
                      {kyc.pan_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.pan_document_url)}
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          PAN
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {kyc.verification_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleReview(kyc)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review & Decide
                        </Button>
                      )}
                      {kyc.verification_status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(kyc)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      )}
                      {kyc.verification_status === 'rejected' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(kyc)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteKYCMutation.mutate(kyc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review KYC Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Applicant: {selectedKYC?.profiles?.full_name}</h4>
                <p className="text-sm text-muted-foreground">Role: {selectedKYC?.profiles?.role}</p>
              </div>

              {/* Document Previews */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedKYC?.citizenship_document_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Citizenship Document</p>
                    <div className="border rounded-lg p-2">
                      <img 
                        src={selectedKYC.citizenship_document_url} 
                        alt="Citizenship Document"
                        className="w-full h-48 object-cover rounded cursor-pointer"
                        onClick={() => openDocument(selectedKYC.citizenship_document_url)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDocument(selectedKYC.citizenship_document_url)}
                        className="w-full mt-2"
                      >
                        View Full Size
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedKYC?.license_document_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">License Document</p>
                    <div className="border rounded-lg p-2">
                      <img 
                        src={selectedKYC.license_document_url} 
                        alt="License Document"
                        className="w-full h-48 object-cover rounded cursor-pointer"
                        onClick={() => openDocument(selectedKYC.license_document_url)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDocument(selectedKYC.license_document_url)}
                        className="w-full mt-2"
                      >
                        View Full Size
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedKYC?.pan_document_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">PAN Document</p>
                    <div className="border rounded-lg p-2">
                      <img 
                        src={selectedKYC.pan_document_url} 
                        alt="PAN Document"
                        className="w-full h-48 object-cover rounded cursor-pointer"
                        onClick={() => openDocument(selectedKYC.pan_document_url)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDocument(selectedKYC.pan_document_url)}
                        className="w-full mt-2"
                      >
                        View Full Size
                      </Button>
                    </div>
                  </div>
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
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={updateKYCMutation.isPending}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
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

export default ManageKYC;
