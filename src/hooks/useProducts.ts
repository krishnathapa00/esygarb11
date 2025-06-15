
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  weight: string;
  deliveryTime: string;
  category: string;
  stockQuantity?: number;
  isActive?: boolean;
}

// Sample products for fallback
const sampleProducts: Product[] = [
  // Fruits & Vegetables
  {
    id: 1,
    name: "Fresh Bananas",
    price: 40,
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 2,
    name: "Organic Apples",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 3,
    name: "Red Tomatoes",
    price: 30,
    originalPrice: 40,
    image: "https://images.unsplash.com/photo-1546470427-e26264b2d5f0?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 4,
    name: "Green Capsicum",
    price: 60,
    originalPrice: 80,
    image: "https://images.unsplash.com/photo-1525607551862-4d2a2b3a7db0?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 5,
    name: "Fresh Carrots",
    price: 35,
    originalPrice: 45,
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 22,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 6,
    name: "Fresh Onions",
    price: 25,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 17,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 7,
    name: "Fresh Potatoes",
    price: 20,
    originalPrice: 25,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 8,
    name: "Green Leafy Vegetables",
    price: 15,
    originalPrice: 20,
    image: "https://images.unsplash.com/photo-1515424201866-4cd3094d33cd?w=400&h=400&fit=crop",
    weight: "250g",
    discount: 25,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables"
  },
  // Dairy & Eggs
  {
    id: 9,
    name: "Fresh Milk",
    price: 25,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    weight: "500ml",
    discount: 17,
    deliveryTime: "5 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 10,
    name: "Greek Yogurt",
    price: 45,
    originalPrice: 55,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 18,
    deliveryTime: "7 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 11,
    name: "Farm Fresh Eggs",
    price: 60,
    originalPrice: 70,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    weight: "12 pieces",
    discount: 14,
    deliveryTime: "6 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 12,
    name: "Paneer",
    price: 80,
    originalPrice: 95,
    image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 16,
    deliveryTime: "8 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 13,
    name: "Cheese Slices",
    price: 120,
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 14,
    deliveryTime: "10 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 14,
    name: "Butter",
    price: 55,
    originalPrice: 65,
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop",
    weight: "100g",
    discount: 15,
    deliveryTime: "8 mins",
    category: "Dairy & Eggs"
  },
  // Snacks & Beverages
  {
    id: 15,
    name: "Potato Chips",
    price: 20,
    originalPrice: 25,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
    weight: "50g",
    discount: 20,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 16,
    name: "Mixed Nuts",
    price: 150,
    originalPrice: 180,
    image: "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&h=400&fit=crop",
    weight: "250g",
    discount: 17,
    deliveryTime: "10 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 17,
    name: "Energy Drink",
    price: 45,
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop",
    weight: "250ml",
    discount: 10,
    deliveryTime: "3 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 18,
    name: "Cookies",
    price: 35,
    originalPrice: 40,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 12,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 19,
    name: "Cold Coffee",
    price: 60,
    originalPrice: 70,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
    weight: "300ml",
    discount: 14,
    deliveryTime: "8 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 20,
    name: "Namkeen Mix",
    price: 25,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop",
    weight: "100g",
    discount: 17,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages"
  }
];

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      // If no products in database, return sample products
      if (!data || data.length === 0) {
        console.log('No products found in database, returning sample products');
        return sampleProducts;
      }

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
        weight: product.weight || '1 unit',
        deliveryTime: product.delivery_time || '10-15 mins',
        category: product.categories?.name || 'Unknown',
        stockQuantity: product.stock_quantity,
        isActive: product.is_active,
      })) as Product[];
    },
  });
};

export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (error) throw error;

      // If no products in database, return filtered sample products
      if (!data || data.length === 0) {
        const categoryNames = {
          1: 'Fruits & Vegetables',
          2: 'Dairy & Eggs',
          3: 'Snacks & Beverages'
        };
        const categoryName = categoryNames[categoryId as keyof typeof categoryNames];
        return sampleProducts.filter(product => product.category === categoryName);
      }

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
        weight: product.weight || '1 unit',
        deliveryTime: product.delivery_time || '10-15 mins',
        category: product.categories?.name || 'Unknown',
        stockQuantity: product.stock_quantity,
        isActive: product.is_active,
      })) as Product[];
    },
  });
};
