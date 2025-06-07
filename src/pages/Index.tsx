
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import LocationDetectionPopup from '../components/LocationDetectionPopup';
import BannerCarousel from '../components/BannerCarousel';
import Footer from '../components/Footer';

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
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1594282486516-0eabf6d37ee8?w=300&h=300&fit=crop",
      weight: "1 kg",
      discount: 14,
      deliveryTime: "10 mins",
      category: "Vegetables"
    },
    {
      id: 6,
      name: "Fresh Tomatoes",
      price: 45,
      originalPrice: 55,
      image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop",
      weight: "500 gm",
      discount: 18,
      deliveryTime: "10 mins",
      category: "Vegetables"
    },
    {
      id: 7,
      name: "Fresh Milk",
      price: 65,
      originalPrice: 70,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop",
      weight: "1 L",
      discount: 7,
      deliveryTime: "10 mins",
      category: "Dairy"
    },
    {
      id: 8,
      name: "Organic Eggs",
      price: 90,
      originalPrice: 100,
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop",
      weight: "12 pcs",
      discount: 10,
      deliveryTime: "10 mins",
      category: "Dairy"
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
        {/* Hero Banner Section */}
        <BannerCarousel />

        {/* Categories */}
        <section className="mb-8">
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </section>

        {/* Featured Products */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Featured Products</h3>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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

      {/* Footer - Desktop Only */}
      <Footer />
    </div>
  );
};

export default Index;
