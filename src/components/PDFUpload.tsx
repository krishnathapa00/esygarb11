import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Eye, FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PDFUploadProps {
  onFileUpload: (url: string) => void;
  currentFile?: string;
  folder?: string;
  label: string;
}

const PDFUpload = ({ onFileUpload, currentFile, folder = 'kyc-documents', label }: PDFUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = 'pdf';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Store the file path for later signed URL generation
      onFileUpload(filePath);
      
      toast({
        title: "File uploaded successfully",
        description: `${label} has been uploaded.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      const fileInput = document.getElementById(`pdf-upload-${label}`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleView = async () => {
    if (currentFile) {
      try {
        const { data: signedUrlData, error } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(currentFile, 3600); // 1 hour expiry

        if (error) throw error;
        window.open(signedUrlData.signedUrl, '_blank');
      } catch (error) {
        console.error('Error viewing file:', error);
        toast({
          title: "Error",
          description: "Failed to open document",
          variant: "destructive"
        });
      }
    }
  };

  const handleRemove = () => {
    onFileUpload('');
    setFileName('');
    // Reset file input
    const fileInput = document.getElementById(`pdf-upload-${label}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {currentFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-8 w-8 text-red-600" />
              <span className="text-sm font-medium text-gray-700">
                {fileName || 'PDF Document'}
              </span>
            </div>
            <div className="flex space-x-2 justify-center">
              <Button
                onClick={handleView}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Button>
              <Button
                onClick={handleRemove}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <label htmlFor={`pdf-upload-${label}`} className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  Click to upload PDF or drag and drop
                </span>
                <input
                  id={`pdf-upload-${label}`}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;