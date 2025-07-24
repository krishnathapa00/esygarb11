
-- Add delivery fee configuration table
CREATE TABLE public.delivery_config (
  id SERIAL PRIMARY KEY,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  delivery_partner_charge DECIMAL(10,2) NOT NULL DEFAULT 30.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Insert default delivery configuration
INSERT INTO public.delivery_config (delivery_fee, delivery_partner_charge) VALUES (50.00, 30.00);

-- Enable RLS for delivery_config
ALTER TABLE public.delivery_config ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_config
CREATE POLICY "Anyone can view delivery config" 
ON public.delivery_config 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage delivery config" 
ON public.delivery_config 
FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Add earnings tracking table
CREATE TABLE public.delivery_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_partner_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  amount DECIMAL(10,2) NOT NULL,
  delivery_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for delivery_earnings
ALTER TABLE public.delivery_earnings ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_earnings
CREATE POLICY "Partners can view own earnings" 
ON public.delivery_earnings 
FOR SELECT 
USING (delivery_partner_id = auth.uid());

CREATE POLICY "Admins can manage all earnings" 
ON public.delivery_earnings 
FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Add order acceptance tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Create function to automatically create earnings when order is delivered
CREATE OR REPLACE FUNCTION public.create_delivery_earnings()
RETURNS TRIGGER AS $$
DECLARE
  partner_charge DECIMAL(10,2);
  delivery_minutes INTEGER;
BEGIN
  -- Only create earnings when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.delivery_partner_id IS NOT NULL THEN
    -- Get the delivery partner charge
    SELECT delivery_partner_charge INTO partner_charge 
    FROM public.delivery_config 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- Calculate delivery time in minutes
    IF NEW.accepted_at IS NOT NULL AND NEW.delivered_at IS NOT NULL THEN
      delivery_minutes := EXTRACT(EPOCH FROM (NEW.delivered_at - NEW.accepted_at)) / 60;
    END IF;
    
    -- Insert earnings record
    INSERT INTO public.delivery_earnings (
      delivery_partner_id, 
      order_id, 
      amount, 
      delivery_time_minutes
    ) VALUES (
      NEW.delivery_partner_id, 
      NEW.id, 
      COALESCE(partner_charge, 30.00),
      delivery_minutes
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for earnings
DROP TRIGGER IF EXISTS create_delivery_earnings_trigger ON public.orders;
CREATE TRIGGER create_delivery_earnings_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_delivery_earnings();

-- Add KYC deletion policy
CREATE POLICY "Admins can delete KYC verifications" 
ON public.kyc_verifications 
FOR DELETE 
USING (public.is_admin_user(auth.uid()));
