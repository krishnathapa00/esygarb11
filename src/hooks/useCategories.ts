import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
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
        image_url:
          category.image_url && category.image_url.trim() !== ""
            ? category.image_url
            : "https://img.freepik.com/free-vector/photo-coming-soon-placeholder-design_1017-25528.jpg",

        productCount: category.product_count || 0,
      })) as Category[];
    },
  });
};
