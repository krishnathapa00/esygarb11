
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
  weight: string; // Made required to match ProductCard interface
  deliveryTime: string;
  category: string;
  stockQuantity?: number;
  isActive?: boolean;
}

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

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price, // Already a number from database
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
        weight: product.weight || '1 unit', // Provide default if null
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

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price, // Already a number from database
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
        weight: product.weight || '1 unit', // Provide default if null
        deliveryTime: product.delivery_time || '10-15 mins',
        category: product.categories?.name || 'Unknown',
        stockQuantity: product.stock_quantity,
        isActive: product.is_active,
      })) as Product[];
    },
  });
};
