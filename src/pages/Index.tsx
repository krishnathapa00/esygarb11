import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategoryGrid from "../components/CategoryGrid";
import ProductSection from "../components/ProductSection";
import BannerCarousel from "../components/BannerCarousel";
import Footer from "../components/Footer";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { cart, addToCart, updateQuantity } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
      quantity: 1,
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const getCartQuantity = (productId: number) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

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

  console.log(products, isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
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
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
