
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText, UserCheck, UserX, Trash2 } from 'lucide-react';
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateKYCMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: any; status: string; comments: string }) => {
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

  const handleReview = (kyc) => {
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

  const getStatusBadge = (status) => {
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

  const openDocument = (url) => {
    if (url) {
      window.open(url, '_blank');
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
            <div>Loading...</div>
          ) : (
            kycVerifications.map((kyc) => (
              <Card key={kyc.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{kyc.profiles?.full_name || 'Unknown User'}</h3>
                      {getStatusBadge(kyc.verification_status)}
                      <Badge variant="outline">{kyc.profiles?.role || 'Unknown'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Phone: {kyc.profiles?.phone_number || 'Not provided'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(kyc.submitted_at).toLocaleDateString()}
                    </p>
                    {kyc.admin_comments && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded">
                        <strong>Admin Comments:</strong> {kyc.admin_comments}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {kyc.citizenship_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.citizenship_document_url)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Citizenship
                        </Button>
                      )}
                      {kyc.license_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.license_document_url)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          License
                        </Button>
                      )}
                      {kyc.pan_document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(kyc.pan_document_url)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          PAN
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(kyc)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {kyc.verification_status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteKYCMutation.mutate(kyc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review KYC Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Applicant: {selectedKYC?.profiles?.full_name}</h4>
                <p className="text-sm text-muted-foreground">Role: {selectedKYC?.profiles?.role}</p>
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
                  className="flex-1"
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
