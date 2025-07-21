-- Fix infinite recursion in profiles table RLS policies
-- Drop ALL existing policies first
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

-- Drop and recreate orders policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and delivery partners can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can create orders" ON public.orders;
DROP POLICY IF EXISTS "Super admins can delete orders" ON public.orders;

CREATE POLICY "Users and partners can view orders" 
ON public.orders FOR SELECT 
USING (
  user_id = auth.uid() OR 
  delivery_partner_id = auth.uid() OR 
  public.is_admin_user(auth.uid())
);

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders" 
ON public.orders FOR ALL 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Delivery partners can update assigned orders" 
ON public.orders FOR UPDATE 
USING (
  delivery_partner_id = auth.uid() OR 
  public.is_admin_user(auth.uid())
);