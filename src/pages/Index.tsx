import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const handleProductSelect = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const fruitProducts = filteredProducts.filter(p => p.category === 'Fruits & Vegetables');
  const dairyProducts = filteredProducts.filter(p => p.category === 'Dairy & Eggs');
  const snackProducts = filteredProducts.filter(p => p.category === 'Snacks & Beverages');

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
      <Header
        cartItems={cartItems}
        onCartClick={() => { }}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setDropdownVisible(!!value);
        }}
      />

      {dropdownVisible && filteredProducts.length > 0 && (
        <div className="absolute z-50 top-34 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg border rounded-md overflow-hidden">
          {filteredProducts.slice(0, 5).map(product => (
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

      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSet={handleLocationSet}
      />

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
