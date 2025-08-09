-- Fix RLS policies for admin operations

-- Allow admins to manage delivery_config
DROP POLICY IF EXISTS "Admins can manage delivery config" ON delivery_config;
CREATE POLICY "Admins can manage delivery config" 
ON delivery_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Allow admins to manage darkstores (fix the function call)
DROP POLICY IF EXISTS "Admins can manage darkstores" ON darkstores;
CREATE POLICY "Admins can manage darkstores" 
ON darkstores 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);