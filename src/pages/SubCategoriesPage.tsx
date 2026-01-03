import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/shared";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shared/ProductCard";
import { useCartActions } from "@/hooks/useCart";

interface Category {
  id: number;
  name: string;
  image_url?: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  weight?: string;
  offer?: string;
  discount?: number;
  subcategory_id: number;
  category_id: number;
  stock_quantity: number;
  delivery_time?: string;
}

const SubCategoriesPage = () => {
  const { slug } = useParams();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );

  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } =
    useCartActions();

  const { data: category } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: subCategories = [] } = useQuery<SubCategory[]>({
    queryKey: ["subcategories", category?.id],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!category?.id,
  });

  // Fetch products for this category
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", category?.id],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!category?.id,
  });

  // Filter products based on search and subcategory
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => product.stock_quantity > 0);

    // Filter by subcategory
    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subcategory_id === selectedSubCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedSubCategory, searchQuery]);

  const handleSubCategoryClick = (subCategoryId: number | null) => {
    setSelectedSubCategory(subCategoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-3 p-2"
            onClick={() => navigate("/categories")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {category?.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {filteredProducts.length} products available
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - SubCategories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border sticky top-20">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </h3>
              </div>
              <div className="p-2">
                {/* All Products */}
                <button
                  onClick={() => handleSubCategoryClick(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedSubCategory === null
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Products (
                  {products.filter((p) => p.stock_quantity > 0).length})
                </button>

                {/* SubCategory List */}
                {subCategories.map((subCategory) => {
                  const productCount = products.filter(
                    (p) =>
                      p.subcategory_id === subCategory.id &&
                      p.stock_quantity > 0
                  ).length;
                  return (
                    <button
                      key={subCategory.id}
                      onClick={() => handleSubCategoryClick(subCategory.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedSubCategory === subCategory.id
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {subCategory.name} ({productCount})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const mappedProduct = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice:
                      product.original_price && product.original_price > 0
                        ? product.original_price
                        : undefined,

                    image: product.image_url || "/placeholder.svg",
                    weight: product.weight || "",
                    discount: product.discount,
                    deliveryTime: product.delivery_time ?? "10 mins",
                    category: category?.name || "",
                    categoryId: product.category_id,
                    stock_quantity: product.stock_quantity,
                  };

                  return (
                    <ProductCard
                      key={product.id}
                      product={mappedProduct}
                      onAddToCart={() => handleAddToCart(mappedProduct)}
                      onUpdateQuantity={(productId, quantity) =>
                        handleUpdateQuantity(productId, quantity)
                      }
                      cartQuantity={getCartQuantity(product.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try searching with different keywords"
                    : "No products available in this category"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default SubCategoriesPage;
