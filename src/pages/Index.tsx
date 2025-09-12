import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategoryGrid from "../components/CategoryGrid";
import ProductSection from "../components/ProductSection";
import BannerCarousel from "../components/BannerCarousel";
import Footer from "../components/Footer";
import LocationDetectionPopup from "../components/LocationDetectionPopup";
import ServiceUnavailableMessage from "../components/ServiceUnavailableMessage";
import { Product, useProducts } from "../hooks/useProducts";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useCartActions } from "@/hooks/useCart";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);

  const { data: products = [], isLoading } = useProducts();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } =
    useCartActions();

  useEffect(() => {
    document.body.classList.add("with-search-bar");

    // Check if user has location set and service availability
    const storedLocation = localStorage.getItem("esygrab_user_location");
    if (!storedLocation) {
      // Block access without location - show location popup immediately
      setShowLocationPopup(true);
      return;
    }

    try {
      const location = JSON.parse(storedLocation);
      setServiceAvailable(location.serviceAvailable !== false);
    } catch (error) {
      console.error("Error parsing stored location:", error);
      setShowLocationPopup(true);
    }

    return () => {
      document.body.classList.remove("with-search-bar");
    };
  }, []);

  const handleCategorySelect = (categoryId: number) => {
    console.log("Category selected:", categoryId);
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleProductSelect = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Group products by category dynamically and sort categories
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const categoryId = product.categoryId ?? -1;
    const categoryName = product.category || "Other";
    const categorySlug = product.categorySlug || "unknown";

    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: categoryName,
        slug: categorySlug,
        products: [],
      };
    }

    acc[categoryId].products.push(product);
    return acc;
  }, {} as Record<number, { name: string; slug: string; products: Product[] }>);

  const categoryOrder = [
    "Fruits & Vegetables",
    "Snacks & Beverages",
    // Add more custom priorities if needed
  ];

  const sortedCategories = Object.entries(productsByCategory).sort(
    ([, aData], [, bData]) => {
      const aIndex = categoryOrder.indexOf(aData.name);
      const bIndex = categoryOrder.indexOf(bData.name);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return aData.name.localeCompare(bData.name);
      }
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 relative overflow-x-hidden">
      <Header />

      {dropdownVisible && filteredProducts.length > 0 && (
        <div className="absolute z-50 top-34 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg border rounded-md overflow-hidden">
          {filteredProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product.id)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {product.name}
            </div>
          ))}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!serviceAvailable ? (
          <ServiceUnavailableMessage />
        ) : (
          <>
            <BannerCarousel />

            <section className="mb-8 hidden md:block">
              <CategoryGrid onCategorySelect={handleCategorySelect} />
            </section>

            {/* Display products by category dynamically */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : (
              <>
                {sortedCategories.map(
                  ([categoryId, categoryData]) =>
                    categoryData.products.length > 0 && (
                      <ProductSection
                        key={categoryId}
                        title={categoryData.name}
                        slug={categoryData.slug}
                        products={categoryData.products}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                        cartQuantityGetter={getCartQuantity}
                      />
                    )
                )}
                {!isLoading && filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No matching products found.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSet={(location) => {
          setShowLocationPopup(false);
        }}
      />
    </div>
  );
};

export default Index;
