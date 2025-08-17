-- First, let's create actual subcategories for the existing categories based on the frontend structure

-- Snacks & Beverage subcategories
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Chips & Namkeen', 1, 'Crunchy chips and namkeen snacks', true),
('Biscuits', 1, 'Sweet and savory biscuits', true),
('Cold Drinks', 1, 'Refreshing cold beverages', true),
('Chocolates', 1, 'Sweet chocolate treats', true),
('Ice Cream', 1, 'Frozen ice cream delights', true);

-- Personal Care subcategories (assuming category_id 2)
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Hair Care', 2, 'Shampoos, conditioners and hair products', true),
('Skin Care', 2, 'Face creams, moisturizers and skin care', true),
('Oral Care', 2, 'Toothpaste, brushes and mouth care', true),
('Body Care', 2, 'Soaps, lotions and body care products', true),
('Feminine Hygiene', 2, 'Sanitary pads and feminine care', true);

-- Home & Kitchen subcategories (assuming category_id 3)
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Kitchen Essentials', 3, 'Basic kitchen tools and utensils', true),
('Cleaning Supplies', 3, 'Detergents, cleaners and supplies', true),
('Storage & Organization', 3, 'Containers and storage solutions', true),
('Home Decor', 3, 'Decorative items for home', true);

-- Dairy & Breakfast subcategories (assuming category_id 4)
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Milk & Dairy', 4, 'Fresh milk and dairy products', true),
('Eggs', 4, 'Fresh eggs and egg products', true),
('Bread & Bakery', 4, 'Fresh bread and bakery items', true),
('Cereals', 4, 'Breakfast cereals and oats', true),
('Honey & Spreads', 4, 'Honey, jams and spreads', true);

-- Instant & Frozen subcategories (assuming category_id 5)
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Instant Noodles', 5, 'Ready-to-cook noodles', true),
('Frozen Vegetables', 5, 'Frozen vegetable mixes', true),
('Frozen Snacks', 5, 'Frozen ready-to-eat snacks', true),
('Ready Meals', 5, 'Pre-cooked ready meals', true);

-- Tea, Coffee & Health Drinks subcategories (assuming category_id 6)
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
('Tea', 6, 'Various types of tea', true),
('Coffee', 6, 'Coffee beans and instant coffee', true),
('Health Drinks', 6, 'Nutritious health beverages', true),
('Energy Drinks', 6, 'Energy boosting drinks', true);