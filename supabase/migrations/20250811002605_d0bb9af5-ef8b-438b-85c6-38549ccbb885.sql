-- Fix RLS policies to enable proper admin operations

-- Fix orders table policies to allow proper deletion
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Fix order_items table policies to allow proper deletion  
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" 
ON public.order_items 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Fix delivery_config table policies to allow proper updates
DROP POLICY IF EXISTS "Admins can manage delivery config" ON public.delivery_config;
CREATE POLICY "Admins can manage delivery config" 
ON public.delivery_config 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Fix darkstores table policies to allow proper CRUD operations
DROP POLICY IF EXISTS "Admins can manage darkstores" ON public.darkstores;
CREATE POLICY "Admins can manage darkstores" 
ON public.darkstores 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Add missing policy for delivery_earnings deletion
CREATE POLICY "Admins can delete delivery earnings" 
ON public.delivery_earnings 
FOR DELETE 
USING (is_admin_user(auth.uid()));

-- Add missing policy for withdrawals deletion
CREATE POLICY "Admins can delete withdrawals" 
ON public.withdrawals 
FOR DELETE 
USING (is_admin_user(auth.uid()));