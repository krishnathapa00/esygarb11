-- Add darkstore support to profiles table
ALTER TABLE public.profiles ADD COLUMN darkstore_id TEXT;
ALTER TABLE public.profiles ADD COLUMN is_online BOOLEAN DEFAULT false;

-- Create darkstores table
CREATE TABLE public.darkstores (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'California',
  zip_code TEXT NOT NULL,
  phone_number TEXT,
  manager_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for darkstores
ALTER TABLE public.darkstores ENABLE ROW LEVEL SECURITY;

-- Create policies for darkstores
CREATE POLICY "Darkstores are viewable by everyone" 
ON public.darkstores 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage darkstores" 
ON public.darkstores 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::user_role
));

-- Add darkstore_id to orders table for tracking which darkstore an order comes from
ALTER TABLE public.orders ADD COLUMN darkstore_id INTEGER REFERENCES public.darkstores(id);

-- Insert some sample darkstores
INSERT INTO public.darkstores (name, address, city, zip_code, phone_number, manager_name) VALUES
('Central Darkstore', '123 Main St', 'Los Angeles', '90210', '+1-555-0101', 'John Manager'),
('North Darkstore', '456 North Ave', 'San Francisco', '94102', '+1-555-0102', 'Jane Smith'),
('East Darkstore', '789 East Blvd', 'San Diego', '92101', '+1-555-0103', 'Mike Johnson');

-- Update order statuses enum to include ready_for_pickup
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_for_pickup';

-- Create trigger for updating darkstore updated_at
CREATE OR REPLACE FUNCTION public.update_darkstore_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_darkstores_updated_at
  BEFORE UPDATE ON public.darkstores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_darkstore_updated_at();