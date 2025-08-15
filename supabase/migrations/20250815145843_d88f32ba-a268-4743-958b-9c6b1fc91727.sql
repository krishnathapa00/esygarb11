-- Create function to auto-assign orders to online delivery partners
CREATE OR REPLACE FUNCTION auto_assign_order_to_partner()
RETURNS TRIGGER AS $$
DECLARE
  available_partner UUID;
BEGIN
  -- Only assign when order becomes 'pending' and has no delivery partner assigned
  IF NEW.status = 'pending' AND NEW.delivery_partner_id IS NULL THEN
    -- Find an online delivery partner who is KYC verified and available
    SELECT id INTO available_partner
    FROM profiles 
    WHERE role = 'delivery_partner' 
      AND is_online = true 
      AND kyc_verified = true
      AND (darkstore_id IS NULL OR darkstore_id = NEW.darkstore_id::text)
    ORDER BY updated_at ASC  -- Assign to partner who was online longest
    LIMIT 1;
    
    -- If found, assign the order
    IF available_partner IS NOT NULL THEN
      NEW.delivery_partner_id := available_partner;
      NEW.status := 'confirmed';
      NEW.accepted_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign orders
DROP TRIGGER IF EXISTS auto_assign_order_trigger ON orders;
CREATE TRIGGER auto_assign_order_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_order_to_partner();