import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
}

export const fetchSubcategories = async (categoryId?: number) => {
  let query = supabase
    .from("subcategories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as Subcategory[];
};

export const useSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("subcategories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Subcategory[];
    },
    enabled: categoryId !== undefined,
  });
};
