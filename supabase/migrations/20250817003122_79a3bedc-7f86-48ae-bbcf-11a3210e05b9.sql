-- Create sequence for subcategories first
CREATE SEQUENCE IF NOT EXISTS subcategories_id_seq;

-- Create subcategories table
CREATE TABLE public.subcategories (
  id integer NOT NULL DEFAULT nextval('subcategories_id_seq'::regclass) PRIMARY KEY,
  name text NOT NULL,
  category_id integer NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Add RLS policies for subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Admins can manage subcategories
CREATE POLICY "Admins can manage subcategories" 
ON public.subcategories 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Subcategories are viewable by everyone
CREATE POLICY "Subcategories are viewable by everyone" 
ON public.subcategories 
FOR SELECT 
USING (is_active = true);

-- Add subcategory_id to products table
ALTER TABLE public.products ADD COLUMN subcategory_id integer REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Create trigger for subcategories updated_at
CREATE TRIGGER update_subcategories_updated_at
    BEFORE UPDATE ON public.subcategories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();