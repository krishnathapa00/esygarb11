
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import ProductSection from '../components/ProductSection';
import LocationDetectionPopup from '../components/LocationDetectionPopup';
import BannerCarousel from '../components/BannerCarousel';
import Footer from '../components/Footer';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  
  const { data: products = [], isLoading } = useProducts();
  const { user } = useAuth();

  useEffect(() => {
    // Check if location has been set before
    const hasLocation = localStorage.getItem('esygrab_user_location');
    if (!hasLocation) {
      setShowLocationPopup(true);
    }
  }, []);

  const handleLocationSet = (location: string) => {
    localStorage.setItem('esygrab_user_location', JSON.stringify({ address: location }));
    setShowLocationPopup(false);
  };

  const handleAddToCart = (product: any) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    setCartItems(prev => prev + 1);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[productId] || 0;
      const diff = quantity - currentQty;
      
      if (quantity <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = quantity;
      }
      
      setCartItems(prevTotal => prevTotal + diff);
      return newCart;
    });
  };

  const handleCategorySelect = (categoryId: number) => {
    console.log('Category selected:', categoryId);
  };

  // Group products by category
  const fruitProducts = products.filter(p => p.category === 'Fruits & Vegetables');
  const dairyProducts = products.filter(p => p.category === 'Dairy & Eggs');
  const snackProducts = products.filter(p => p.category === 'Snacks & Beverages');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-xs sm:text-base">Loading fresh products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSet={handleLocationSet}
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Hero Banner Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10 pt-4 sm:pt-6 lg:pt-8">
          <BannerCarousel />
        </div>

        {/* Categories Section */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </section>

        {/* Products by Category - Horizontal Sliders */}
        <div className="space-y-8 sm:space-y-10 lg:space-y-12 pb-6">
          {fruitProducts.length > 0 && (
            <ProductSection
              title="Fresh Fruits & Vegetables"
              products={fruitProducts}
              onAddToCart={handleAddToCart}
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}

          {dairyProducts.length > 0 && (
            <ProductSection
              title="Dairy & Eggs"
              products={dairyProducts}
              onAddToCart={handleAddToCart}
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}

          {snackProducts.length > 0 && (
            <ProductSection
              title="Snacks & Beverages"
              products={snackProducts}
              onAddToCart={handleAddToCart}
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
        </div>
      </main>

      {/* Footer - Desktop Only */}
      <div className="hidden lg:block mt-12 lg:mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
