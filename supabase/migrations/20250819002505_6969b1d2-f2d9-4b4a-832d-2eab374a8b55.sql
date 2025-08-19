-- Fix subcategory assignments to correct categories
UPDATE subcategories 
SET category_id = CASE 
  WHEN name IN ('Biscuits', 'Cold Drinks', 'Chocolates', 'Ice Cream', 'Chips & Namkeen') THEN 3  -- Snacks & Beverages
  WHEN name IN ('Hair Care', 'Skin Care', 'Oral Care', 'Body Care', 'Feminine Hygiene') THEN 4  -- Personal Care
  ELSE category_id 
END
WHERE name IN ('Biscuits', 'Cold Drinks', 'Chocolates', 'Ice Cream', 'Chips & Namkeen', 'Hair Care', 'Skin Care', 'Oral Care', 'Body Care', 'Feminine Hygiene');