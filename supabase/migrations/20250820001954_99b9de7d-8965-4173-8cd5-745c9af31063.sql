-- Fix subcategory assignments and update delivery times to 10 minutes
-- First update subcategories to be under correct categories

-- Update Fresh Vegetables subcategories (category_id = 1)
UPDATE subcategories SET category_id = 1 WHERE name IN ('Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Spinach', 'Cabbage');

-- Update Organic Fruits subcategories (category_id = 2) 
UPDATE subcategories SET category_id = 2 WHERE name IN ('Apples', 'Bananas', 'Oranges', 'Grapes', 'Berries', 'Mangoes');

-- Update Dairy & Eggs subcategories (category_id = 3)
UPDATE subcategories SET category_id = 3 WHERE name IN ('Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs', 'Cream');

-- Update Snacks & Beverages subcategories (category_id = 4)
UPDATE subcategories SET category_id = 4 WHERE name IN ('Chips & Namkeen', 'Biscuits', 'Chocolates', 'Soft Drinks', 'Juices', 'Tea & Coffee');

-- Update Personal Care subcategories (category_id = 5)
UPDATE subcategories SET category_id = 5 WHERE name IN ('Soap & Shampoo', 'Toothpaste & Dental', 'Skincare', 'Hair Care', 'Deodorants', 'Baby Care');

-- Update delivery times in products to "10 mins"
UPDATE products SET delivery_time = '10 mins' WHERE delivery_time = '10-15 mins' OR delivery_time IS NULL;

-- Update delivery config to have 10 minute timer
UPDATE delivery_config SET delivery_partner_charge = 30.00, delivery_fee = 50.00;