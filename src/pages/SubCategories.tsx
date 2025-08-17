import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import ProductCard, { Product } from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: number;
  name: string;
  image_url?: string;
  color_gradient?: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
}

interface ProductWithCategory {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  weight?: string;
  discount?: number;
  delivery_time?: string;
  stock_quantity?: number;
  category_id?: number;
  subcategory_id?: number;
  is_active: boolean;
}

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );
  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } =
    useCartActions();

  // Fetch category data
  const { data: category } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', Number(categoryId))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });

  // Fetch subcategories for this category
  const { data: subCategories = [] } = useQuery<SubCategory[]>({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', Number(categoryId))
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId,
  });

  // Fetch products for this category
  const { data: products = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['category-products', categoryId, selectedSubCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', Number(categoryId))
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedSubCategory) {
        query = query.eq('subcategory_id', selectedSubCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId,
  });

  // Transform products to match ProductCard interface
  const transformedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.original_price || undefined,
    image: product.image_url || 'https://images.unsplash.com/photo-1586523969132-4ea8eac63a4e?w=400&h=400&fit=crop',
    weight: product.weight || '1 unit',
    discount: product.discount || undefined,
    deliveryTime: product.delivery_time || '10-15 mins',
    category: category?.name || 'Category',
  }));

  const categoryName = category?.name || "Category";

  // Filter products by selected subcategory
  const filteredProducts = selectedSubCategory 
    ? transformedProducts.filter(product => {
        // Find the original product to check subcategory_id
        const originalProduct = products.find(p => p.id === product.id);
        return originalProduct?.subcategory_id === selectedSubCategory;
      })
    : transformedProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header Section */}
      <div className="bg-white border-b z-30">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="mr-2 p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              {categoryName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-208px)]">
        {/* Left Sidebar - Subcategories */}
        <div className="w-16 sm:w-20 md:w-24 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0">
          <div className="py-2 px-1">
            {/* All Products Option */}
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`w-full mb-1.5 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-200 ${
                selectedSubCategory === null
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight">
                All
              </div>
              <div className="text-[8px] sm:text-[9px] md:text-[10px] opacity-75 mt-0.5">
                {transformedProducts.length}
              </div>
            </button>

            {/* Subcategory Pills */}
            {subCategories.map((subCategory) => {
              const subCategoryProductCount = products.filter(p => p.subcategory_id === subCategory.id).length;
              return (
                <button
                  key={subCategory.id}
                  onClick={() => setSelectedSubCategory(subCategory.id)}
                  className={`w-full mb-1.5 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-200 ${
                    selectedSubCategory === subCategory.id
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight break-words">
                    {subCategory.name}
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] opacity-75 mt-0.5">
                    {subCategoryProductCount}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content - Products Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {selectedSubCategory
                  ? subCategories.find(
                      (sub) => sub.id === selectedSubCategory
                    )?.name
                  : "All Products"}{" "}
                ({filteredProducts.length})
              </h2>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    cartQuantity={getCartQuantity(product.id)}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">No products found</div>
                <div className="text-sm text-gray-400">
                  {selectedSubCategory 
                    ? "No products in this subcategory yet" 
                    : "No products in this category yet"
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default CategoryProducts;