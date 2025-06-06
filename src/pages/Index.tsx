
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard, { Product } from '../components/ProductCard';
import Cart from '../components/Cart';
import { Button } from '@/components/ui/button';
import { Clock, Truck, Package } from 'lucide-react';

// Sample products data
const products: Product[] = [
  {
    id: 1,
    name: "Fresh Bananas",
    price: 40,
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 2,
    name: "Fresh Milk",
    price: 60,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    weight: "1 L",
    deliveryTime: "10 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 3,
    name: "Organic Apples",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 4,
    name: "Bread Loaf",
    price: 25,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop",
    weight: "400g",
    deliveryTime: "8 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 5,
    name: "Mixed Vegetables",
    price: 80,
    originalPrice: 100,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 20,
    deliveryTime: "15 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 6,
    name: "Greek Yogurt",
    price: 45,
    image: "https://images.unsplash.com/photo-1571212515416-dfb9c0b97f98?w=400&h=400&fit=crop",
    weight: "200g",
    deliveryTime: "10 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 7,
    name: "Orange Juice",
    price: 85,
    originalPrice: 100,
    image: "https://images.unsplash.com/photo-1560963689-ba5f0c9ca2f8?w=400&h=400&fit=crop",
    weight: "1 L",
    discount: 15,
    deliveryTime: "8 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 8,
    name: "Organic Carrots",
    price: 35,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
    weight: "500g",
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables"
  }
];

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === null || 
                            (selectedCategory === 1 && product.category === "Fruits & Vegetables") ||
                            (selectedCategory === 2 && product.category === "Dairy & Eggs") ||
                            (selectedCategory === 3 && product.category === "Snacks & Beverages");
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const getCartQuantity = (productId: number) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItems={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Groceries in
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                10 minutes
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Fresh groceries & essentials delivered to your doorstep
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-300" />
                <span className="font-medium">10 min delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-yellow-300" />
                <span className="font-medium">Free delivery over ₹200</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-yellow-300" />
                <span className="font-medium">Fresh guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryGrid onCategorySelect={setSelectedCategory} />

        {/* Products Section */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? 'Category Products' : 'Popular Products'}
            </h2>
            {selectedCategory && (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                View All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                cartQuantity={getCartQuantity(product.id)}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white rounded-2xl mb-8 shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose QuickMart?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the fastest grocery delivery with fresh quality products
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get your groceries delivered in just 10 minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Quality</h3>
              <p className="text-gray-600">Hand-picked fresh products with quality guarantee</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-gray-600">No delivery charges on orders above ₹200</p>
            </div>
          </div>
        </div>
      </div>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default Index;
