-- First remove order_items that reference the products we want to delete
DELETE FROM order_items WHERE product_id IN (2, 3, 32, 39, 40);

-- Then remove the products themselves
DELETE FROM products WHERE id IN (2, 3, 32, 39, 40);