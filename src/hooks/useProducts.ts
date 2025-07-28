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
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
    description:
      "Fresh, sweet bananas directly sourced from farms. Rich in potassium and natural sugars, perfect for a healthy snack or breakfast.",
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: 2,
    name: "Organic Apples",
    price: 120,
    originalPrice: 150,
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables",
    description:
      "Crisp and juicy organic apples with no chemical residue. Great for immunity and digestion.",
    rating: 4.6,
    reviews: 104,
    inStock: true,
  },
  {
    id: 3,
    name: "Red Tomatoes",
    price: 30,
    originalPrice: 40,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables",
    description:
      "Juicy red tomatoes perfect for salads and cooking. A rich source of Vitamin C and antioxidants.",
    rating: 4.4,
    reviews: 87,
    inStock: true,
  },
  {
    id: 4,
    name: "Green Capsicum",
    price: 60,
    originalPrice: 80,
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
    description:
      "Fresh green capsicum packed with vitamin C. Perfect for stir-fry or salads.",
    rating: 4.3,
    reviews: 76,
    inStock: true,
  },
  {
    id: 5,
    name: "Fresh Carrots",
    price: 35,
    originalPrice: 45,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 22,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables",
    description:
      "Crunchy and sweet carrots full of beta-carotene. Great for eye health and skin.",
    rating: 4.5,
    reviews: 93,
    inStock: true,
  },
  {
    id: 6,
    name: "Fresh Onions",
    price: 25,
    originalPrice: 30,
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 17,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
    description:
      "Staple kitchen essential, these fresh onions are full of flavor and nutrients.",
    rating: 4.2,
    reviews: 101,
    inStock: true,
  },

  // Dairy & Eggs
  {
    id: 9,
    name: "Fresh Milk",
    price: 25,
    originalPrice: 30,
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    weight: "500ml",
    discount: 17,
    deliveryTime: "5 mins",
    category: "Dairy & Eggs",
    description:
      "Pure and fresh cow milk packed with calcium and protein for a healthy lifestyle.",
    rating: 4.7,
    reviews: 88,
    inStock: true,
  },
  {
    id: 10,
    name: "Greek Yogurt",
    price: 45,
    originalPrice: 55,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 18,
    deliveryTime: "7 mins",
    category: "Dairy & Eggs",
    description:
      "Thick and creamy Greek yogurt high in protein and probiotics.",
    rating: 4.6,
    reviews: 70,
    inStock: true,
  },
  {
    id: 11,
    name: "Farm Fresh Eggs",
    price: 60,
    originalPrice: 70,
    image:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    weight: "12 pieces",
    discount: 14,
    deliveryTime: "6 mins",
    category: "Dairy & Eggs",
    description:
      "Nutrient-rich eggs sourced directly from farms. Great for breakfast or baking.",
    rating: 4.8,
    reviews: 134,
    inStock: true,
  },
  {
    id: 12,
    name: "Paneer",
    price: 80,
    originalPrice: 95,
    image:
      "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 16,
    deliveryTime: "8 mins",
    category: "Dairy & Eggs",
    description:
      "Soft and fresh paneer full of protein. Ideal for curries and snacks.",
    rating: 4.5,
    reviews: 99,
    inStock: true,
  },

  // Snacks & Beverages
  {
    id: 15,
    name: "Potato Chips",
    price: 20,
    originalPrice: 25,
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
    weight: "50g",
    discount: 20,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages",
    description:
      "Crispy and delicious potato chips. Perfect for snacking anytime.",
    rating: 4.2,
    reviews: 65,
    inStock: true,
  },
  {
    id: 16,
    name: "Mixed Nuts",
    price: 150,
    originalPrice: 180,
    image:
      "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&h=400&fit=crop",
    weight: "250g",
    discount: 17,
    deliveryTime: "10 mins",
    category: "Snacks & Beverages",
    description:
      "A healthy blend of almonds, cashews, walnuts and raisins. Great source of energy and nutrients.",
    rating: 4.8,
    reviews: 112,
    inStock: true,
  },
  {
    id: 17,
    name: "Energy Drink",
    price: 45,
    originalPrice: 50,
    image:
      "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop",
    weight: "250ml",
    discount: 10,
    deliveryTime: "3 mins",
    category: "Snacks & Beverages",
    description:
      "Refreshing energy drink to boost your stamina and alertness instantly.",
    rating: 4.1,
    reviews: 78,
    inStock: true,
  },
  {
    id: 18,
    name: "Cookies",
    price: 35,
    originalPrice: 40,
    image:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 12,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages",
    description:
      "Delicious crunchy cookies made with wholesome ingredients. Perfect tea-time companion.",
    rating: 4.3,
    reviews: 89,
    inStock: true,
  },
];

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
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
          .eq("is_active", true);

        if (error) {
          console.log("Database error:", error);
          console.log("Returning sample products due to database error");
          return sampleProducts;
        }

        // If no products in database, return sample products
        if (!data || data.length === 0) {
          console.log(
            "No products found in database, returning sample products"
          );
          return sampleProducts;
        }

        return data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.original_price || undefined,
          discount: product.discount,
          image:
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop",
          weight: product.weight || "1 unit",
          deliveryTime: product.delivery_time || "10-15 mins",
          category: product.categories?.name || "Unknown",
          stockQuantity: product.stock_quantity,
        })) as Product[];
      } catch (error) {
        console.log("Query error:", error);
        console.log("Returning sample products due to query error");
        return sampleProducts;
      }
    },
  });
};

export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      try {
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

        if (error) {
          console.log("Database error for category:", error);
          // Return filtered sample products
          const categoryNames = {
            1: "Fruits & Vegetables",
            2: "Dairy & Eggs",
            3: "Snacks & Beverages",
          };
          const categoryName =
            categoryNames[categoryId as keyof typeof categoryNames];
          return sampleProducts.filter(
            (product) => product.category === categoryName
          );
        }

        // If no products in database, return filtered sample products
        if (!data || data.length === 0) {
          const categoryNames = {
            1: "Fruits & Vegetables",
            2: "Dairy & Eggs",
            3: "Snacks & Beverages",
          };
          const categoryName =
            categoryNames[categoryId as keyof typeof categoryNames];
          return sampleProducts.filter(
            (product) => product.category === categoryName
          );
        }

        return data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.original_price || undefined,
          discount: product.discount,
          image:
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop",
          weight: product.weight || "1 unit",
          deliveryTime: product.delivery_time || "10-15 mins",
          category: product.categories?.name || "Unknown",
          stockQuantity: product.stock_quantity,
          isActive: product.is_active,
        })) as Product[];
      } catch (error) {
        console.log("Query error for category:", error);
        // Return filtered sample products
        const categoryNames = {
          1: "Fruits & Vegetables",
          2: "Dairy & Eggs",
          3: "Snacks & Beverages",
        };
        const categoryName =
          categoryNames[categoryId as keyof typeof categoryNames];
        return sampleProducts.filter(
          (product) => product.category === categoryName
        );
      }
    },
  });
};
