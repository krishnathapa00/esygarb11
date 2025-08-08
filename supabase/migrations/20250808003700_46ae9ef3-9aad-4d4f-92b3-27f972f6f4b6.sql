-- Fix RLS policy for delivery_earnings to allow delivery partners to insert their own earnings
DROP POLICY IF EXISTS "Partners can view own earnings" ON delivery_earnings;

-- Create new policies that allow both viewing and inserting own earnings
CREATE POLICY "Partners can view own earnings" 
ON delivery_earnings 
FOR SELECT 
USING (delivery_partner_id = auth.uid());

CREATE POLICY "Partners can create own earnings" 
ON delivery_earnings 
FOR INSERT 
WITH CHECK (delivery_partner_id = auth.uid());