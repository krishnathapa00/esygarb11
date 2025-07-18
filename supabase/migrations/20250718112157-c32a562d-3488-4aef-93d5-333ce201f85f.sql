-- Step 1: Fix image upload issue by ensuring user-avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for user avatars
INSERT INTO storage.objects (bucket_id, name) VALUES ('user-avatars', '.emptyFolderPlaceholder') ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view user avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 2: Make krishna@esygrab.com super admin
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'krishna@esygrab.com' 
  LIMIT 1
);

-- Step 3: Create storage bucket for KYC documents if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create proper KYC storage policies
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own KYC documents" ON storage.objects
FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Step 4: Add super admin permissions for deleting users, orders, and transactions
CREATE POLICY "Super admins can delete users" ON public.profiles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'::user_role
  )
);

CREATE POLICY "Super admins can delete orders" ON public.orders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'::user_role
  )
);