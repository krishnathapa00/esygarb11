import React, { useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MultipleImageUploadProps {
  onImagesUpload: (urls: string[]) => void;
  currentImages?: string[];
  folder?: string;
  maxImages?: number;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({ 
  onImagesUpload, 
  currentImages = [], 
  folder = 'products',
  maxImages = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (currentImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      const allUrls = [...currentImages, ...newUrls];
      onImagesUpload(allUrls);
      
      toast({
        title: "Images uploaded successfully",
        description: `${newUrls.length} image(s) uploaded and saved`
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newUrls = currentImages.filter((_, index) => index !== indexToRemove);
    onImagesUpload(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Plus className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> images
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB (max {maxImages})</p>
          </div>
          <input 
            type="file" 
            multiple
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading || currentImages.length >= maxImages}
          />
        </label>
      </div>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                alt={`Image ${index + 1}`} 
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          <span className="ml-2 text-sm text-gray-600">Uploading images...</span>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;