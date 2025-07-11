-- Insert profile for krishna@esygrab.com with admin role
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'::user_role
FROM auth.users 
WHERE email = 'krishna@esygrab.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;