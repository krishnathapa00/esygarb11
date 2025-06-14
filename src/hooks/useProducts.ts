
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

// Sample products data
const sampleProducts: Product[] = [
  // Fruits & Vegetables
  {
    id: 1,
    name: "Fresh Bananas",
    price: 40,
    originalPrice: 50,
    discount: 20,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop",
    weight: "1 kg",
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    price: 30,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop",
    weight: "500g",
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 3,
    name: "Green Spinach",
    price: 25,
    originalPrice: 30,
    discount: 17,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop",
    weight: "250g",
    deliveryTime: "15 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 4,
    name: "Red Apples",
    price: 120,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop",
    weight: "1 kg",
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  
  // Dairy & Eggs
  {
    id: 5,
    name: "Fresh Milk",
    price: 60,
    originalPrice: 65,
    discount: 8,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop",
    weight: "1 L",
    deliveryTime: "15 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 6,
    name: "Farm Fresh Eggs",
    price: 90,
    image: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=300&h=300&fit=crop",
    weight: "12 pcs",
    deliveryTime: "10 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 7,
    name: "Cottage Cheese",
    price: 80,
    originalPrice: 90,
    discount: 11,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=300&fit=crop",
    weight: "200g",
    deliveryTime: "15 mins",
    category: "Dairy & Eggs"
  },
  
  // Snacks & Beverages
  {
    id: 8,
    name: "Potato Chips",
    price: 45,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop",
    weight: "100g",
    deliveryTime: "10 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 9,
    name: "Orange Juice",
    price: 85,
    originalPrice: 100,
    discount: 15,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop",
    weight: "1 L",
    deliveryTime: "15 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 10,
    name: "Mixed Nuts",
    price: 250,
    image: "https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=300&h=300&fit=crop",
    weight: "200g",
    deliveryTime: "10 mins",
    category: "Snacks & Beverages"
  }
];

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (
              name
            )
          `)
          .eq('is_active', true);

        if (error) {
          console.log('Database error, using sample data:', error);
          return sampleProducts;
        }

        if (!data || data.length === 0) {
          console.log('No products in database, using sample data');
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
      } catch (error) {
        console.log('Error fetching products, using sample data:', error);
        return sampleProducts;
      }
    },
  });
};

export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      try {
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

        if (error) {
          console.log('Database error, filtering sample data by category');
          const categoryNames = {
            1: 'Fruits & Vegetables',
            2: 'Dairy & Eggs',
            3: 'Snacks & Beverages',
            4: 'Personal Care',
            5: 'Home & Kitchen',
            6: 'Baby Care'
          };
          return sampleProducts.filter(p => p.category === categoryNames[categoryId as keyof typeof categoryNames]);
        }

        if (!data || data.length === 0) {
          const categoryNames = {
            1: 'Fruits & Vegetables',
            2: 'Dairy & Eggs',
            3: 'Snacks & Beverages',
            4: 'Personal Care',
            5: 'Home & Kitchen',
            6: 'Baby Care'
          };
          return sampleProducts.filter(p => p.category === categoryNames[categoryId as keyof typeof categoryNames]);
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
      } catch (error) {
        console.log('Error fetching products by category, using sample data');
        const categoryNames = {
          1: 'Fruits & Vegetables',
          2: 'Dairy & Eggs',
          3: 'Snacks & Beverages',
          4: 'Personal Care',
          5: 'Home & Kitchen',
          6: 'Baby Care'
        };
        return sampleProducts.filter(p => p.category === categoryNames[categoryId as keyof typeof categoryNames]);
      }
    },
  });
};
