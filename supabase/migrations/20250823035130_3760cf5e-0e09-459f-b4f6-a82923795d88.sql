-- Add delivery fee waiver tracking for first 5 orders
ALTER TABLE orders ADD COLUMN is_delivery_waived BOOLEAN DEFAULT FALSE;

-- Add distance check and store location configuration
CREATE TABLE IF NOT EXISTS store_locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Main Store',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  delivery_radius_km INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store location
INSERT INTO store_locations (name, latitude, longitude, delivery_radius_km) 
VALUES ('New Baneshwor Store', 27.687421, 85.340841, 3)
ON CONFLICT DO NOTHING;

-- Function to calculate order count for delivery fee waiver
CREATE OR REPLACE FUNCTION check_delivery_fee_waiver(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  completed_orders_count INTEGER;
BEGIN
  -- Count completed orders (delivered status)
  SELECT COUNT(*) INTO completed_orders_count
  FROM orders 
  WHERE user_id = user_id_param 
  AND status = 'delivered';
  
  -- Return TRUE if user has less than 5 completed orders
  RETURN completed_orders_count < 5;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  earth_radius CONSTANT DOUBLE PRECISION := 6371; -- Earth radius in kilometers
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  
  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlng / 2) * SIN(dlng / 2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Function to check if delivery is available for coordinates
CREATE OR REPLACE FUNCTION check_delivery_availability(
  delivery_lat DOUBLE PRECISION,
  delivery_lng DOUBLE PRECISION
) RETURNS BOOLEAN AS $$
DECLARE
  store_record RECORD;
  distance_km DOUBLE PRECISION;
BEGIN
  -- Get active store location
  SELECT latitude, longitude, delivery_radius_km
  INTO store_record
  FROM store_locations
  WHERE is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate distance
  SELECT calculate_distance_km(
    store_record.latitude,
    store_record.longitude,
    delivery_lat,
    delivery_lng
  ) INTO distance_km;
  
  -- Return TRUE if within delivery radius
  RETURN distance_km <= store_record.delivery_radius_km;
END;
$$ LANGUAGE plpgsql;