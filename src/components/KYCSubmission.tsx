import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SingleImageUpload from './SingleImageUpload';

const KYCSubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState({
    citizenship_document_url: '',
    license_document_url: '',
    pan_document_url: ''
  });

  // Fetch existing KYC status
  const { data: kycStatus, refetch } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  const handleDocumentUpload = (field: string, url: string) => {
    setDocuments(prev => ({
      ...prev,
      [field]: url
    }));
  };

  const submitKYCMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if all documents are uploaded
      const allDocumentsUploaded = Object.values(documents).every(url => url);
      if (!allDocumentsUploaded) {
        throw new Error('Please upload all required documents before submitting.');
      }

      const { error } = await supabase
        .from('kyc_verifications')
        .insert([{
          user_id: user.id,
          citizenship_document_url: documents.citizenship_document_url,
          license_document_url: documents.license_document_url,
          pan_document_url: documents.pan_document_url,
          verification_status: 'pending',
          submitted_at: new Date().toISOString()
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status', user?.id] });
      toast({
        title: "KYC Submitted Successfully!",
        description: "Your documents have been submitted for review. You'll be notified once verified."
      });
      
      // Reset form
      setDocuments({
        citizenship_document_url: '',
        license_document_url: '',
        pan_document_url: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current KYC Status */}
      {kycStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(kycStatus.verification_status || 'pending')}
              KYC Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(kycStatus.verification_status || 'pending')}>
                  {(kycStatus.verification_status || 'pending').toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Submitted: {new Date(kycStatus.submitted_at).toLocaleDateString()}</p>
                {kycStatus.reviewed_at && (
                  <p>Reviewed: {new Date(kycStatus.reviewed_at).toLocaleDateString()}</p>
                )}
              </div>

              {kycStatus.admin_comments && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Admin Comments:</p>
                  <p className="text-sm text-gray-600">{kycStatus.admin_comments}</p>
                </div>
              )}

              {kycStatus.verification_status === 'approved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">You are verified and can start accepting deliveries!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC Submission Form */}
      {(!kycStatus || (kycStatus.verification_status !== 'approved' && kycStatus.verification_status !== 'pending')) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              Submit KYC Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Citizenship Document */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Citizenship Document *</h3>
                  {documents.citizenship_document_url && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <SingleImageUpload
                  onImageUpload={(url) => handleDocumentUpload('citizenship_document_url', url)}
                  currentImage={documents.citizenship_document_url}
                  folder="kyc-documents"
                />
                <p className="text-xs text-muted-foreground">
                  Upload clear photo of your citizenship certificate
                </p>
              </div>

              {/* License Document */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Driving License *</h3>
                  {documents.license_document_url && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <SingleImageUpload
                  onImageUpload={(url) => handleDocumentUpload('license_document_url', url)}
                  currentImage={documents.license_document_url}
                  folder="kyc-documents"
                />
                <p className="text-xs text-muted-foreground">
                  Upload clear photo of your driving license
                </p>
              </div>

              {/* PAN Document */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">PAN Card *</h3>
                  {documents.pan_document_url && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <SingleImageUpload
                  onImageUpload={(url) => handleDocumentUpload('pan_document_url', url)}
                  currentImage={documents.pan_document_url}
                  folder="kyc-documents"
                />
                <p className="text-xs text-muted-foreground">
                  Upload clear photo of your PAN card
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => submitKYCMutation.mutate()}
                disabled={submitKYCMutation.isPending || !Object.values(documents).every(url => url)}
                className="w-full"
              >
                {submitKYCMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting for Review...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• All documents must be clear and readable</p>
              <p>• Review process typically takes 1-2 business days</p>
              <p>• You'll be notified via email once your KYC is verified</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYCSubmission;