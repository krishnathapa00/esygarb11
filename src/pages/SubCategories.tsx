import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCartActions } from "@/hooks/useCart";
import ProductCard from "@/components/shared/ProductCard";

const SubCategories = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } =
    useCartActions();

  // Map category slug to display name and filter products
  const getCategoryInfo = (slug: string) => {
    const categoryMap: { [key: string]: { name: string; filter: string } } = {
      "fresh-vegetables": {
        name: "Fresh Vegetables",
        filter: "Fruits & Vegetables",
      },
      "organic-fruits": {
        name: "Organic Fruits",
        filter: "Fruits & Vegetables",
      },
      "dairy-products": { name: "Dairy & Eggs", filter: "Dairy & Eggs" },
      "snacks-beverages": {
        name: "Snacks & Beverages",
        filter: "Snacks & Beverages",
      },
      "personal-care": { name: "Personal Care", filter: "Personal Care" },
    };
    return categoryMap[slug] || { name: "Category", filter: "" };
  };

  const categoryInfo = getCategoryInfo(categorySlug || "");
  const filteredProducts = products.filter(
    (p) => p.category === categoryInfo.filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-3"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {categoryInfo.name}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                cartQuantity={getCartQuantity(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found in this category.
            </p>
            <Link
              to="/"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategories;

