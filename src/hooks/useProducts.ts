import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  weight: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  deliveryTime: string;
  category: string;
  categoryId: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories:category_id (
            id,
            name
          )
        `
        )
        .eq("is_active", true);

      if (error) throw error;

      return (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image:
          product.image_url ||
          "https://via.placeholder.com/300x300?text=No+Image",
        weight: product.weight || "1 unit",
        deliveryTime: product.delivery_time || "10 mins",
        category: product.categories?.name || "Unknown",
        categoryId: product.categories?.id ?? -1, // <- for sorting by category id
        stockQuantity: product.stock_quantity,
        rating: 4.5,
        reviews: 50,
        inStock: (product.stock_quantity ?? 0) > 0,
        isActive: product.is_active,
      })) as Product[];
    },
  });
};

export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories:category_id (
            name
          )
        `
        )
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;

      return (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price || undefined,
        discount: product.discount,
        image:
          product.image_url ||
          "https://via.placeholder.com/300x300?text=No+Image",
        weight: product.weight || "1 unit",
        deliveryTime: product.delivery_time || "10 mins",
        category: product.categories?.name || "Unknown",
        stockQuantity: product.stock_quantity,
        rating: 4.5,
        reviews: 50,
        inStock: (product.stock_quantity ?? 0) > 0,
        isActive: product.is_active,
      })) as Product[];
    },
  });
};
