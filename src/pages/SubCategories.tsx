
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const subCategories = {
  1: [
    { id: 1, name: 'Fruits', productCount: 45 },
    { id: 2, name: 'Vegetables', productCount: 38 },
    { id: 3, name: 'Dry Fruits', productCount: 22 },
    { id: 4, name: 'Herbs', productCount: 15 },
    { id: 5, name: 'Exotic', productCount: 18 },
  ],
  2: [
    { id: 6, name: 'Milk', productCount: 25 },
    { id: 7, name: 'Curd & Yogurt', productCount: 18 },
    { id: 8, name: 'Paneer & Tofu', productCount: 12 },
    { id: 9, name: 'Cheese', productCount: 15 },
    { id: 10, name: 'Butter & Ghee', productCount: 10 },
  ],
  3: [
    { id: 11, name: 'Chips & Namkeen', productCount: 35 },
    { id: 12, name: 'Biscuits', productCount: 28 },
    { id: 13, name: 'Cold Drinks', productCount: 20 },
    { id: 14, name: 'Chocolates', productCount: 25 },
    { id: 15, name: 'Ice Cream', productCount: 15 },
  ],
};

const sampleProducts: Product[] = [
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
    id: 3,
    name: "Red Tomatoes",
    price: 30,
    originalPrice: 40,
    image: "https://images.unsplash.com/photo-1546470427-e26264b2d5f0?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 4,
    name: "Green Capsicum",
    price: 60,
    originalPrice: 80,
    image: "https://images.unsplash.com/photo-1525607551862-4d2a2b3a7db0?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 5,
    name: "Fresh Oranges",
    price: 80,
    originalPrice: 100,
    image: "https://images.unsplash.com/photo-1561052208-65d4d6954da0?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "15 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 6,
    name: "Green Grapes",
    price: 90,
    originalPrice: 120,
    image: "https://images.unsplash.com/photo-1591979282341-40f4b8b7a0e6?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 25,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 7,
    name: "Fresh Carrots",
    price: 35,
    originalPrice: 45,
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 22,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 8,
    name: "Fresh Onions",
    price: 25,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 17,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 9,
    name: "Fresh Milk",
    price: 25,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    weight: "500ml",
    discount: 17,
    deliveryTime: "5 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 10,
    name: "Greek Yogurt",
    price: 45,
    originalPrice: 55,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 18,
    deliveryTime: "7 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 11,
    name: "Farm Fresh Eggs",
    price: 60,
    originalPrice: 70,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    weight: "12 pieces",
    discount: 14,
    deliveryTime: "6 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 12,
    name: "Paneer",
    price: 80,
    originalPrice: 95,
    image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 16,
    deliveryTime: "8 mins",
    category: "Dairy & Eggs"
  },
  {
    id: 13,
    name: "Potato Chips",
    price: 20,
    originalPrice: 25,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
    weight: "50g",
    discount: 20,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 14,
    name: "Mixed Nuts",
    price: 150,
    originalPrice: 180,
    image: "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&h=400&fit=crop",
    weight: "250g",
    discount: 17,
    deliveryTime: "10 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 15,
    name: "Energy Drink",
    price: 45,
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop",
    weight: "250ml",
    discount: 10,
    deliveryTime: "3 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 16,
    name: "Cookies",
    price: 35,
    originalPrice: 40,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 12,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages"
  },
  {
    id: 17,
    name: "Fresh Cucumber",
    price: 20,
    originalPrice: 25,
    image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables"
  },
  {
    id: 18,
    name: "Bell Peppers",
    price: 70,
    originalPrice: 85,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 18,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables"
  }
];

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  
  const categorySubCategories = subCategories[Number(categoryId) as keyof typeof subCategories] || [];
  
  const categoryNames = {
    1: 'Fruits & Vegetables',
    2: 'Dairy & Eggs', 
    3: 'Snacks & Beverages',
  };
  
  const categoryName = categoryNames[Number(categoryId) as keyof typeof categoryNames] || 'Category';

  // Filter products by category
  const filteredProducts = sampleProducts.filter(product => {
    if (Number(categoryId) === 1) return product.category === 'Fruits & Vegetables';
    if (Number(categoryId) === 2) return product.category === 'Dairy & Eggs';
    if (Number(categoryId) === 3) return product.category === 'Snacks & Beverages';
    return true;
  });

  const handleAddToCart = (product: Product) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Header Section */}
      <div className="bg-white border-b sticky top-[128px] z-30">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="mr-2 p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{categoryName}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-208px)]">
        {/* Left Sidebar - Vertical Subcategory Pills */}
        <div className="w-24 bg-white border-r border-gray-100 overflow-y-auto">
          <div className="py-2">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`w-full p-3 text-center transition-colors ${
                selectedSubCategory === null 
                  ? 'bg-green-50 border-r-2 border-green-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium text-gray-900 leading-tight">
                All
              </div>
            </button>
            {categorySubCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                onClick={() => setSelectedSubCategory(subCategory.id)}
                className={`w-full p-3 text-center transition-colors ${
                  selectedSubCategory === subCategory.id 
                    ? 'bg-green-50 border-r-2 border-green-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-900 leading-tight">
                  {subCategory.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {subCategory.productCount}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-gray-900">
                {selectedSubCategory 
                  ? categorySubCategories.find(sub => sub.id === selectedSubCategory)?.name 
                  : 'All Products'
                } ({filteredProducts.length})
              </h2>
            </div>
            
            {/* Products Grid - 6 columns for desktop, responsive for mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={cart[product.id] || 0}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default CategoryProducts;
