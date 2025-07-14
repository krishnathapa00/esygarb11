-- Create KYC verification table for delivery partners
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  citizenship_document_url TEXT,
  license_document_url TEXT,
  pan_document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for KYC verification
CREATE POLICY "Users can view their own KYC status" 
ON public.kyc_verifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can submit their own KYC documents" 
ON public.kyc_verifications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending KYC" 
ON public.kyc_verifications 
FOR UPDATE 
USING (user_id = auth.uid() AND verification_status = 'pending');

CREATE POLICY "Admins can manage all KYC verifications" 
ON public.kyc_verifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create storage buckets for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false);

-- Create policies for KYC document storage
CREATE POLICY "Users can upload their own KYC documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all KYC documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add KYC verification status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN kyc_verified BOOLEAN DEFAULT false;

-- Create function to update profile KYC status when verification is approved
CREATE OR REPLACE FUNCTION public.update_profile_kyc_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    UPDATE public.profiles 
    SET kyc_verified = true 
    WHERE id = NEW.user_id;
  ELSIF NEW.verification_status != 'approved' AND OLD.verification_status = 'approved' THEN
    UPDATE public.profiles 
    SET kyc_verified = false 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic KYC status update
CREATE TRIGGER update_profile_kyc_trigger
  AFTER UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_kyc_status();

-- Update existing profiles to mark admin and delivery_partner roles as verified initially
UPDATE public.profiles 
SET kyc_verified = true 
WHERE role IN ('admin', 'super_admin');

-- Create function for automatic order assignment notifications (simulating real-time updates)
CREATE OR REPLACE FUNCTION public.notify_order_available()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be enhanced with actual real-time notifications in production
  -- For now, this ensures the trigger exists for future real-time features
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_order_available();