import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import LocationDetectionPopup from '../components/LocationDetectionPopup';

const Index = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPopup, setShowLocationPopup] = useState(false);

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

  // Sample products data
  const featuredProducts = [
    {
      id: 1,
      name: "Fresh Bananas",
      price: 40,
      originalPrice: 50,
      image: "/placeholder.svg",
      unit: "1 kg",
      discount: 20
    },
    {
      id: 2,
      name: "Organic Apples",
      price: 120,
      originalPrice: 150,
      image: "/placeholder.svg",
      unit: "1 kg",
      discount: 20
    },
    {
      id: 3,
      name: "Juicy Oranges",
      price: 60,
      originalPrice: 75,
      image: "/placeholder.svg",
      unit: "1 kg",
      discount: 15
    },
    {
      id: 4,
      name: "Sweet Strawberries",
      price: 80,
      originalPrice: 100,
      image: "/placeholder.svg",
      unit: "250 gm",
      discount: 20
    },
    {
      id: 5,
      name: "Green Cabbage",
      price: 30,
      originalPrice: 35,
      image: "/placeholder.svg",
      unit: "1 kg",
      discount: 14
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
          <CategoryGrid />
        </section>

        {/* Featured Products */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                unit={product.unit}
                discount={product.discount}
                onAddToCart={() => setCartItems(prev => prev + 1)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
