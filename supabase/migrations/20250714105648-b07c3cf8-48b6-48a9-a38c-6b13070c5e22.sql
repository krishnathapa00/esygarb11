-- Add a super_admin role for special authority to delete records
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';