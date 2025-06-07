
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const subCategories = {
  1: [
    { id: 1, name: 'Fresh Fruits', productCount: 80 },
    { id: 2, name: 'Fresh Vegetables', productCount: 70 },
  ],
  2: [
    { id: 3, name: 'Milk & Dairy', productCount: 45 },
    { id: 4, name: 'Eggs', productCount: 15 },
    { id: 5, name: 'Cheese & Butter', productCount: 25 },
  ],
  3: [
    { id: 6, name: 'Beverages', productCount: 120 },
    { id: 7, name: 'Snacks', productCount: 80 },
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
];

const SubCategories = () => {
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/categories">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Sub Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedSubCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedSubCategory === null 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              {categorySubCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => setSelectedSubCategory(subCategory.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedSubCategory === subCategory.id 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{subCategory.name}</span>
                    <span className="text-sm text-gray-500">({subCategory.productCount})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSubCategory 
                  ? categorySubCategories.find(sub => sub.id === selectedSubCategory)?.name 
                  : 'All Products'
                }
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sampleProducts.map((product) => (
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
    </div>
  );
};

export default SubCategories;
