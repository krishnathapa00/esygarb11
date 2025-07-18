-- Step 2: Make krishna@esygrab.com super admin  
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'krishna@esygrab.com' 
  LIMIT 1
);

-- Step 4: Add super admin permissions for deleting orders (this should not conflict)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Super admins can delete orders'
    ) THEN
        CREATE POLICY "Super admins can delete orders" ON public.orders
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super_admin'::user_role
          )
        );
    END IF;
END $$;

-- Step 5: Add super admin permissions for deleting profiles (this should not conflict)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Super admins can delete users'
    ) THEN
        CREATE POLICY "Super admins can delete users" ON public.profiles
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super_admin'::user_role
          )
        );
    END IF;
END $$;