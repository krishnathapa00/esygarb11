-- Fix admin access issues by updating RLS policies
-- Allow super_admin to access all admin functionality

-- Update delivery partners access
DROP POLICY IF EXISTS "Admins can manage all KYC verifications" ON kyc_verifications;
CREATE POLICY "Admins can manage all KYC verifications" ON kyc_verifications
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Update profiles access for admin users management
DROP POLICY IF EXISTS "Select own profile" ON profiles;
CREATE POLICY "Select own profile" ON profiles
FOR SELECT 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Update orders to show all orders for admin and delivery partners
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  delivery_partner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role, 'delivery_partner'::user_role])
  )
);

-- Allow admins to insert orders (for testing/management purposes)
CREATE POLICY "Admins can create orders" ON orders
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Update order_items access for admins
DROP POLICY IF EXISTS "Users can view order items for own orders" ON order_items;
CREATE POLICY "Users can view order items for own orders" ON order_items
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      orders.delivery_partner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
      )
    )
  )
);

-- Allow admins to manage order_items
CREATE POLICY "Admins can manage order items" ON order_items
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Allow admins to delete products 
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- Create a function to automatically create order ready status
CREATE OR REPLACE FUNCTION create_order_with_ready_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial status
  INSERT INTO order_status_history (order_id, status, notes)
  VALUES (NEW.id, 'pending', 'Order placed');
  
  -- If order is confirmed, also set ready_for_pickup
  IF NEW.status = 'confirmed' THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, 'ready_for_pickup', 'Order ready for pickup');
    
    -- Update order status to ready_for_pickup
    UPDATE orders SET status = 'ready_for_pickup' WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS after_order_insert ON orders;
CREATE TRIGGER after_order_insert
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_with_ready_status();