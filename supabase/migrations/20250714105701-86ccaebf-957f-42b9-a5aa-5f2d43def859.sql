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

-- Fetch delivery partners for assignment
CREATE OR REPLACE FUNCTION public.get_delivery_partners()
RETURNS TABLE (
  id uuid,
  full_name text,
  phone_number text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, full_name, phone_number
  FROM public.profiles 
  WHERE role = 'delivery_partner'::user_role
$$;