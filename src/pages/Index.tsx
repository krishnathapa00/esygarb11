
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import LocationDetectionPopup from '../components/LocationDetectionPopup';

const Index = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});

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
    // Navigate to category page or filter products
  };

  // Sample products data - updated to match ProductCard interface
  const featuredProducts = [
    {
      id: 1,
      name: "Fresh Bananas",
      price: 40,
      originalPrice: 50,
      image: "/placeholder.svg",
      weight: "1 kg",
      discount: 20,
      deliveryTime: "10 mins",
      category: "Fruits"
    },
    {
      id: 2,
      name: "Organic Apples",
      price: 120,
      originalPrice: 150,
      image: "/placeholder.svg",
      weight: "1 kg",
      discount: 20,
      deliveryTime: "10 mins",
      category: "Fruits"
    },
    {
      id: 3,
      name: "Juicy Oranges",
      price: 60,
      originalPrice: 75,
      image: "/placeholder.svg",
      weight: "1 kg",
      discount: 15,
      deliveryTime: "10 mins",
      category: "Fruits"
    },
    {
      id: 4,
      name: "Sweet Strawberries",
      price: 80,
      originalPrice: 100,
      image: "/placeholder.svg",
      weight: "250 gm",
      discount: 20,
      deliveryTime: "10 mins",
      category: "Fruits"
    },
    {
      id: 5,
      name: "Green Cabbage",
      price: 30,
      originalPrice: 35,
      image: "/placeholder.svg",
      weight: "1 kg",
      discount: 14,
      deliveryTime: "10 mins",
      category: "Vegetables"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Fresh Groceries Delivered in 10 Minutes!
          </h2>
          <p className="text-green-100 mb-4">
            Get farm-fresh vegetables, fruits, and daily essentials delivered to your doorstep
          </p>
        </div>

        {/* Categories */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h3>
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </section>

        {/* Featured Products */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                cartQuantity={cart[product.id] || 0}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2 px-4">
          <a href="/" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-green-600 bg-green-50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a href="/categories" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-gray-600 hover:text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs font-medium">Categories</span>
          </a>
          <a href="/cart" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-gray-600 hover:text-green-600 relative">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M7 13L5.4 5M7 13h10" />
            </svg>
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems}
              </span>
            )}
            <span className="text-xs font-medium">Cart</span>
          </a>
          <a href="/profile" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-gray-600 hover:text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Account</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
