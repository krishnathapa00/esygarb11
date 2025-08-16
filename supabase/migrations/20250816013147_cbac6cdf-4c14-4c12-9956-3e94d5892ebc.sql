-- Create role-based session management

-- Add role validation function
CREATE OR REPLACE FUNCTION public.validate_user_role(user_id uuid, expected_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = expected_role::user_role
  );
$$;