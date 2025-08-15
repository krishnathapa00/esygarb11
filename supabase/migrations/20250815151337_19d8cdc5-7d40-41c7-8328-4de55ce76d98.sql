-- Create a function to clean up expired sessions
-- This helps maintain the database by removing old inactive sessions

CREATE OR REPLACE FUNCTION public.cleanup_expired_user_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user profiles to set is_online = false for delivery partners 
  -- who haven't been active for more than 1 day
  UPDATE public.profiles 
  SET is_online = false 
  WHERE role = 'delivery_partner' 
    AND updated_at < NOW() - INTERVAL '1 day'
    AND is_online = true;
    
  -- Log the cleanup action
  RAISE NOTICE 'Cleaned up expired delivery partner sessions';
END;
$$;

-- Create a function to track user activity
CREATE OR REPLACE FUNCTION public.update_user_activity(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET updated_at = NOW()
  WHERE id = user_id;
END;
$$;