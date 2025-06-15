
-- Set the role to 'admin' for the profile linked to email 'krishna@esygrab.com'
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE lower(email) = lower('krishna@esygrab.com')
);
