-- Fix infinite recursion in profiles table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete users" ON public.profiles;

-- Create new simplified policies without recursive references
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a security definer function to check admin roles safely
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Super admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Create the super admin user with proper credentials
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',  -- Fixed UUID
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'krishna@esygrab.com',
  '$2a$10$XEHyFZ6FeHKrBWWnxjGAaOXZRVINz4T9wxqhTqpJAKrfHiKLMM1hO',  -- password: admin123
  NOW(),
  NOW(),
  '',
  NULL,
  '',
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Krishna Admin","role":"super_admin"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = '$2a$10$XEHyFZ6FeHKrBWWnxjGAaOXZRVINz4T9wxqhTqpJAKrfHiKLMM1hO',
  raw_user_meta_data = '{"full_name":"Krishna Admin","role":"super_admin"}',
  email_confirmed_at = NOW();

-- Ensure profile exists for super admin
INSERT INTO public.profiles (
  id, 
  full_name, 
  role, 
  kyc_verified
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Krishna Admin',
  'super_admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  kyc_verified = true,
  full_name = 'Krishna Admin';

-- Create delivery partner test user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  'e47ac10b-58cc-4372-a567-0e02b2c3d478',  -- Fixed UUID for delivery partner
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'delivery@test.com',
  '$2a$10$XEHyFZ6FeHKrBWWnxjGAaOXZRVINz4T9wxqhTqpJAKrfHiKLMM1hO',  -- password: admin123
  NOW(),
  NOW(),
  '',
  NULL,
  '',
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Delivery Partner","role":"delivery_partner","vehicle_type":"Motorcycle","license_number":"ABC123"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = '$2a$10$XEHyFZ6FeHKrBWWnxjGAaOXZRVINz4T9wxqhTqpJAKrfHiKLMM1hO',
  raw_user_meta_data = '{"full_name":"Test Delivery Partner","role":"delivery_partner","vehicle_type":"Motorcycle","license_number":"ABC123"}',
  email_confirmed_at = NOW();

-- Ensure profile exists for delivery partner
INSERT INTO public.profiles (
  id, 
  full_name, 
  role, 
  vehicle_type,
  license_number,
  kyc_verified,
  phone_number
) VALUES (
  'e47ac10b-58cc-4372-a567-0e02b2c3d478',
  'Test Delivery Partner',
  'delivery_partner',
  'Motorcycle',
  'ABC123',
  true,
  '+977-9841234567'
) ON CONFLICT (id) DO UPDATE SET
  role = 'delivery_partner',
  vehicle_type = 'Motorcycle',
  license_number = 'ABC123',
  kyc_verified = true,
  full_name = 'Test Delivery Partner';