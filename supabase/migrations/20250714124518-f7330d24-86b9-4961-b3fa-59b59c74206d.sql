-- Add delivery partner specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT;