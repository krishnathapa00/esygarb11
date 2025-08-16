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

-- Add session invalidation function
CREATE OR REPLACE FUNCTION public.invalidate_other_role_sessions(user_id uuid, current_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder for session invalidation logic
  -- In a full implementation, this would clear session tokens for other roles
  -- For now, we'll handle this on the frontend
  NULL;
END;
$$;