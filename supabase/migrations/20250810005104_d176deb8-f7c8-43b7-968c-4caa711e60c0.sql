-- Fix RLS policies for admin functions
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Admins can manage darkstores" ON public.darkstores;
DROP POLICY IF EXISTS "Admins can manage delivery config" ON public.delivery_config;

-- Create new policies with proper admin check
CREATE POLICY "Admins can manage darkstores" 
ON public.darkstores 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage delivery config" 
ON public.delivery_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);