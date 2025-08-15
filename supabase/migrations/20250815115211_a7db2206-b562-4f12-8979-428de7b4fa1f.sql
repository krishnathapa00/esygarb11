-- Fix RLS policies for orders and order_status_history tables
-- Allow authenticated users to insert their own orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own orders (for status changes)
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix order_status_history RLS policies
-- Allow system to insert order status history when orders are created
DROP POLICY IF EXISTS "System can insert order status history" ON public.order_status_history;
CREATE POLICY "System can insert order status history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their order status history
DROP POLICY IF EXISTS "Users can view their order status history" ON public.order_status_history;
CREATE POLICY "Users can view their order status history" 
ON public.order_status_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);