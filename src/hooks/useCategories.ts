import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  gradient: string;
  productCount: number;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;

      return data.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image:
          category.image_url ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
        gradient: category.color_gradient || "from-gray-400 to-gray-500",
        productCount: category.product_count || 0,
      })) as Category[];
    },
  });
};

