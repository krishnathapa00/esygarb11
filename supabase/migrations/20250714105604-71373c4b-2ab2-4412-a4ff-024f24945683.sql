-- Add a super_admin role for special authority to delete records
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'delivery_partner');
  END IF;
END $$;

-- Alter the user_role enum to add super_admin if it doesn't exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create a function to check if user has super admin privileges
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'::user_role
  )
$$;