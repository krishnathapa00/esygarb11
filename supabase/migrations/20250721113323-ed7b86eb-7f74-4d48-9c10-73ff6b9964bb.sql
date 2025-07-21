-- Fix infinite recursion in profiles table RLS policies
-- Drop existing problematic policies
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

-- Update krishna@esygrab.com profile to super_admin if it exists
UPDATE public.profiles 
SET role = 'super_admin', kyc_verified = true, full_name = 'Krishna Admin'
WHERE id IN (
  SELECT u.id FROM auth.users u 
  WHERE u.email = 'krishna@esygrab.com'
);

-- Also create a sample delivery partner profile if it doesn't exist
-- This will be handled by the handle_new_user trigger when they sign up

-- Fix other table policies that might have similar issues
-- Update products policies to use the security definer function
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Update categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Update darkstores policies
DROP POLICY IF EXISTS "Admins can manage darkstores" ON public.darkstores;
CREATE POLICY "Admins can manage darkstores" 
ON public.darkstores FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Update orders policies
DROP POLICY IF EXISTS "Admins and delivery partners can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can create orders" ON public.orders;
DROP POLICY IF EXISTS "Super admins can delete orders" ON public.orders;

CREATE POLICY "Admins can manage orders" 
ON public.orders FOR ALL 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Delivery partners can update assigned orders" 
ON public.orders FOR UPDATE 
USING (
  delivery_partner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'delivery_partner'
  )
);

CREATE POLICY "Delivery partners can view assigned orders" 
ON public.orders FOR SELECT 
USING (
  user_id = auth.uid() OR 
  delivery_partner_id = auth.uid() OR 
  public.is_admin_user(auth.uid())
);

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update KYC policies
DROP POLICY IF EXISTS "Admins can manage all KYC verifications" ON public.kyc_verifications;
CREATE POLICY "Admins can manage all KYC verifications" 
ON public.kyc_verifications FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Add some sample products and categories if they don't exist
INSERT INTO public.categories (name, image_url, color_gradient, product_count) VALUES
('Groceries', '/placeholder.svg', 'from-green-400 to-green-600', 5),
('Electronics', '/placeholder.svg', 'from-blue-400 to-blue-600', 3),
('Fashion', '/placeholder.svg', 'from-purple-400 to-purple-600', 2)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, image_url, category_id, stock_quantity, weight, offer, discount) VALUES
('Fresh Milk 1L', 'Pure cow milk, rich in calcium and protein', 60, 65, '/placeholder.svg', 1, 50, '1L', '5% off', 5),
('Organic Eggs (12 pcs)', 'Farm fresh organic eggs', 150, 160, '/placeholder.svg', 1, 30, '12 pieces', '10 off', 10),
('Basmati Rice 5kg', 'Premium quality basmati rice', 450, 500, '/placeholder.svg', 1, 20, '5kg', '50 off', 50),
('Wireless Headphones', 'Bluetooth 5.0 wireless headphones', 2500, 3000, '/placeholder.svg', 2, 15, '200g', '500 off', 500),
('Smart Phone', 'Latest Android smartphone', 25000, 28000, '/placeholder.svg', 2, 10, '180g', '3000 off', 3000),
('Cotton T-Shirt', 'Premium cotton t-shirt', 800, 900, '/placeholder.svg', 3, 25, '150g', '100 off', 100)
ON CONFLICT (name) DO NOTHING;

-- Add a sample darkstore
INSERT INTO public.darkstores (name, address, city, state, zip_code, phone_number, manager_name) VALUES
('EsyGrab Central Hub', 'Kathmandu Plaza, Thamel', 'Kathmandu', 'Bagmati', '44600', '+977-1-4415678', 'Ram Sharma')
ON CONFLICT (name) DO NOTHING;