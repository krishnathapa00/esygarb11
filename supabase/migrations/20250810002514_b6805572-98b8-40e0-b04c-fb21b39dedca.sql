-- Add delivery time tracking column to orders table
ALTER TABLE public.orders ADD COLUMN delivery_time_minutes INTEGER;

-- Update the delivery earnings trigger to also track delivery time in orders
CREATE OR REPLACE FUNCTION public.update_order_delivery_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  delivery_minutes INTEGER;
BEGIN
  -- Only calculate when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Calculate delivery time in minutes
    IF NEW.accepted_at IS NOT NULL THEN
      delivery_minutes := EXTRACT(EPOCH FROM (NEW.delivered_at - NEW.accepted_at)) / 60;
      
      -- Update the delivery time in the orders table
      NEW.delivery_time_minutes := delivery_minutes;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update delivery time when order is completed
CREATE TRIGGER update_order_delivery_time_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_delivery_time();