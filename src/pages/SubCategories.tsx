
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '../hooks/use-mobile';

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

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

  const SidebarContent = () => (
    <div className="bg-white h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Categories</h3>
      </div>
      <div className="p-4">
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedSubCategory(null);
              if (isMobile) setIsSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-3 rounded-lg transition-colors text-sm ${
              selectedSubCategory === null 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            All Products
          </button>
          {categorySubCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => {
                setSelectedSubCategory(subCategory.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors text-sm ${
                selectedSubCategory === subCategory.id 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{subCategory.name}</span>
                <span className="text-xs text-gray-500">({subCategory.productCount})</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Mobile Filter Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/categories">
                  <Button variant="ghost" size="sm" className="mr-2 p-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">{categoryName}</h1>
              </div>
              
              {/* Mobile Filter Button */}
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Menu className="h-4 w-4" />
                  <span className="text-xs">Filter</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0 border-r bg-white">
              <SidebarContent />
            </div>
          )}

          {/* Products Section */}
          <div className="flex-1 p-4">
            <div className="mb-4">
              <h2 className="text-base font-medium text-gray-900">
                {selectedSubCategory 
                  ? categorySubCategories.find(sub => sub.id === selectedSubCategory)?.name 
                  : 'All Products'
                }
              </h2>
              <p className="text-sm text-gray-500 mt-1">{sampleProducts.length} products</p>
            </div>
            
            {/* Products Grid - Zepto style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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

export default CategoryProducts;
