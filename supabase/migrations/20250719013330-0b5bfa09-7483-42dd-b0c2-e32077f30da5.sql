-- Create professional EsyGrab logo as default header
-- Fix super-admin login to allow both admin and super_admin roles in admin panel
-- Set krishna@esygrab.com as super-admin and allow them to login to admin panel

-- Update krishna user to be super_admin
UPDATE public.profiles 
SET role = 'super_admin'::user_role
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'krishna@esygrab.com'
);

-- Create order assignment system for darkstore-based delivery partners
CREATE OR REPLACE FUNCTION public.auto_assign_orders_to_partners()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify available delivery partners when order becomes ready_for_pickup
  IF NEW.status = 'ready_for_pickup' AND OLD.status != 'ready_for_pickup' THEN
    -- This would integrate with real-time notifications in production
    -- For now, the trigger exists for future real-time features
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS auto_assign_orders_trigger ON public.orders;
CREATE TRIGGER auto_assign_orders_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_orders_to_partners();

-- Improve the get_delivery_partners function to filter by darkstore and online status
CREATE OR REPLACE FUNCTION public.get_delivery_partners(_darkstore_id INTEGER DEFAULT NULL)
RETURNS TABLE(id uuid, full_name text, phone_number text, darkstore_id text, is_online boolean)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.id, p.full_name, p.phone_number, p.darkstore_id, p.is_online
  FROM public.profiles p
  WHERE p.role = 'delivery_partner'::user_role
    AND p.kyc_verified = true
    AND (
      _darkstore_id IS NULL 
      OR p.darkstore_id = _darkstore_id::text
    )
  ORDER BY p.is_online DESC, p.full_name;
$$;

-- Create darkstore selection function for delivery partners
CREATE OR REPLACE FUNCTION public.get_available_darkstores()
RETURNS TABLE(id integer, name text, address text, city text, state text, zip_code text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, name, address, city, state, zip_code
  FROM public.darkstores
  WHERE is_active = true
  ORDER BY name;
$$;