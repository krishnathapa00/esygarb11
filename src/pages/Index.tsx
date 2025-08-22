import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategoryGrid from "../components/CategoryGrid";
import ProductSection from "../components/ProductSection";
import BannerCarousel from "../components/BannerCarousel";
import Footer from "../components/Footer";
import LocationDetectionPopup from "../components/LocationDetectionPopup";
import ServiceUnavailableMessage from "../components/ServiceUnavailableMessage";
import { useProducts } from "../hooks/useProducts";
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

  // Add class to body for search bar styling and handle location detection
  useEffect(() => {
    document.body.classList.add('with-search-bar');
    
    // Check if user has location set and service availability
    const storedLocation = localStorage.getItem("esygrab_user_location");
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        setServiceAvailable(location.serviceAvailable !== false);
      } catch (error) {
        console.error('Error parsing stored location:', error);
        setServiceAvailable(true);
      }
    } else if (!user) {
      // For new users, show location popup after 3 seconds
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        document.body.classList.remove('with-search-bar');
      };
    }
    
    return () => {
      document.body.classList.remove('with-search-bar');
    };
  }, [user]);

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

  const fruitProducts = filteredProducts.filter(
    (p) => p.category === "Fruits & Vegetables"
  );
  const dairyProducts = filteredProducts.filter(
    (p) => p.category === "Dairy & Eggs"
  );
  const snackProducts = filteredProducts.filter(
    (p) => p.category === "Snacks & Beverages"
  );

  // Remove the blocking loading state - show content with loading indicators instead

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

            <section className="mb-8">
              <CategoryGrid onCategorySelect={handleCategorySelect} />
            </section>

            {fruitProducts.length > 0 && (
              <ProductSection
                title="Fresh Fruits & Vegetables"
                products={fruitProducts}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                cartQuantityGetter={getCartQuantity}
              />
            )}

            {dairyProducts.length > 0 && (
              <ProductSection
                title="Dairy & Eggs"
                products={dairyProducts}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                cartQuantityGetter={getCartQuantity}
              />
            )}

            {snackProducts.length > 0 && (
              <ProductSection
                title="Snacks & Beverages"
                products={snackProducts}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                cartQuantityGetter={getCartQuantity}
              />
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No matching products found.</p>
              </div>
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
          console.log('Location set:', location);
          setShowLocationPopup(false);
        }}
      />
    </div>
  );
};

export default Index;
