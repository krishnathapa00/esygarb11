-- Update existing profiles that should be delivery partners based on auth metadata
UPDATE public.profiles 
SET 
  role = 'delivery_partner'::user_role,
  full_name = auth_users.raw_user_meta_data->>'full_name',
  vehicle_type = auth_users.raw_user_meta_data->>'vehicle_type',
  license_number = auth_users.raw_user_meta_data->>'license_number'
FROM auth.users AS auth_users
WHERE profiles.id = auth_users.id 
  AND auth_users.raw_user_meta_data->>'role' = 'delivery_partner';