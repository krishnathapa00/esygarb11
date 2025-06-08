
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 1, name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=400&fit=crop', color: 'from-green-400 to-emerald-500', productCount: 150 },
  { id: 2, name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', color: 'from-blue-400 to-cyan-500', productCount: 85 },
  { id: 3, name: 'Snacks & Beverages', image: 'https://images.unsplash.com/photo-1560963689-ba5f0c9ca2f8?w=400&h=400&fit=crop', color: 'from-orange-400 to-amber-500', productCount: 200 },
  { id: 4, name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', color: 'from-pink-400 to-rose-500', productCount: 120 },
  { id: 5, name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', color: 'from-purple-400 to-indigo-500', productCount: 180 },
  { id: 6, name: 'Baby Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', color: 'from-yellow-400 to-orange-500', productCount: 95 },
];

const Categories = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Categories</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm">
                  {category.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
