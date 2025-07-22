import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, FileText, CheckCircle, XCircle, Clock, 
  AlertCircle, Download, Eye, Trash2 
} from 'lucide-react';

interface KYCVerification {
  id: string;
  citizenship_document_url: string | null;
  license_document_url: string | null;
  pan_document_url: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  admin_comments: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const KYCUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [adminComments, setAdminComments] = useState('');
  
  const citizenshipInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  // Fetch KYC verification status
  const { data: kycVerification, refetch } = useQuery({
    queryKey: ['kyc-verification', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user
  });

  // Upload document mutation
  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${documentType}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);
      
      // Update or create KYC verification record
      const updateData = {
        [`${documentType}_document_url`]: publicUrl,
        verification_status: 'pending' as const
      };
      
      if (kycVerification) {
        const { error } = await supabase
          .from('kyc_verifications')
          .update(updateData)
          .eq('id', kycVerification.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kyc_verifications')
          .insert({
            user_id: user?.id,
            ...updateData
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, { documentType }) => {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      refetch();
      toast({
        title: "Document Uploaded",
        description: `${documentType} document uploaded successfully. Awaiting admin review.`
      });
    },
    onError: (error: any, { documentType }) => {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload ${documentType} document.`,
        variant: "destructive"
      });
    }
  });

  // Submit for review mutation
  const submitForReview = useMutation({
    mutationFn: async () => {
      if (!kycVerification) throw new Error('No KYC verification found');
      
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          verification_status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .eq('id', kycVerification.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Submitted for Review",
        description: "Your KYC documents have been submitted for admin review."
      });
    }
  });

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPG, PNG, or PDF files.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(prev => ({ ...prev, [documentType]: true }));
    uploadDocument.mutate({ file, documentType });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getDocumentStatus = (documentUrl: string | null) => {
    if (!documentUrl) {
      return <Badge variant="outline" className="text-gray-600">Not Uploaded</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" />Uploaded</Badge>;
  };

  const isAllDocumentsUploaded = () => {
    return kycVerification?.citizenship_document_url && 
           kycVerification?.license_document_url && 
           kycVerification?.pan_document_url;
  };

  const viewDocument = async (documentType: string, url: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get userId/documentType.ext
      
      // Get signed URL for viewing
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        throw new Error('Failed to get signed URL');
      }
    } catch (error: any) {
      toast({
        title: "Failed to view document",
        description: error.message || "Could not load document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* KYC Status Overview */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            KYC Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Overall Status:</span>
            {kycVerification ? getStatusBadge(kycVerification.verification_status) : getStatusBadge('pending')}
          </div>
          
          {kycVerification?.verification_status === 'rejected' && kycVerification.admin_comments && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Admin Comments</h4>
                  <p className="text-sm text-red-700 mt-1">{kycVerification.admin_comments}</p>
                </div>
              </div>
            </div>
          )}
          
          {kycVerification?.verification_status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Your KYC verification is complete! You can now receive orders.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Citizenship Document */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Citizenship Document</CardTitle>
            <p className="text-sm text-muted-foreground">Upload your citizenship certificate or passport</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              {getDocumentStatus(kycVerification?.citizenship_document_url)}
            </div>
            
            {kycVerification?.citizenship_document_url && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDocument('citizenship', kycVerification.citizenship_document_url!)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            )}
            
            <div>
              <input
                ref={citizenshipInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'citizenship');
                }}
              />
              <Button
                variant="outline"
                onClick={() => citizenshipInputRef.current?.click()}
                disabled={uploading.citizenship || kycVerification?.verification_status === 'approved'}
                className="w-full"
              >
                {uploading.citizenship ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {kycVerification?.citizenship_document_url ? 'Replace' : 'Upload'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* License Document */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Driving License</CardTitle>
            <p className="text-sm text-muted-foreground">Upload your valid driving license</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              {getDocumentStatus(kycVerification?.license_document_url)}
            </div>
            
            {kycVerification?.license_document_url && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDocument('license', kycVerification.license_document_url!)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            )}
            
            <div>
              <input
                ref={licenseInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'license');
                }}
              />
              <Button
                variant="outline"
                onClick={() => licenseInputRef.current?.click()}
                disabled={uploading.license || kycVerification?.verification_status === 'approved'}
                className="w-full"
              >
                {uploading.license ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {kycVerification?.license_document_url ? 'Replace' : 'Upload'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PAN Document */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">PAN Card</CardTitle>
            <p className="text-sm text-muted-foreground">Upload your PAN card for tax purposes</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              {getDocumentStatus(kycVerification?.pan_document_url)}
            </div>
            
            {kycVerification?.pan_document_url && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDocument('pan', kycVerification.pan_document_url!)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            )}
            
            <div>
              <input
                ref={panInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'pan');
                }}
              />
              <Button
                variant="outline"
                onClick={() => panInputRef.current?.click()}
                disabled={uploading.pan || kycVerification?.verification_status === 'approved'}
                className="w-full"
              >
                {uploading.pan ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {kycVerification?.pan_document_url ? 'Replace' : 'Upload'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit for Review */}
      {isAllDocumentsUploaded() && kycVerification?.verification_status !== 'approved' && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">All Documents Uploaded!</h3>
                {kycVerification?.verification_status === 'pending' ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Your documents are submitted for review. Admin will verify and approve your KYC.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Admin Review
                      </Badge>
                      <p className="text-sm text-yellow-700 mt-2">
                        📋 Documents have been submitted successfully<br/>
                        ⏳ Admin verification is in progress<br/>
                        🔔 You'll be notified once approved
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Click below to submit your documents for admin review.
                    </p>
                    <Button 
                      onClick={() => submitForReview.mutate()}
                      disabled={submitForReview.isPending}
                      className="bg-primary hover:bg-primary/90 px-8 py-2"
                      size="lg"
                    >
                      {submitForReview.isPending ? "Submitting..." : "Send for Review"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Upload clear, high-quality images or PDF files</li>
            <li>• Ensure all text and details are clearly visible</li>
            <li>• File size should not exceed 5MB</li>
            <li>• Supported formats: JPG, PNG, PDF</li>
            <li>• All documents must be valid and not expired</li>
            <li>• Review will be completed within 24-48 hours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCUpload;