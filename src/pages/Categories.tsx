import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Clock, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 1, name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=400&fit=crop', color: 'bg-green-100', textColor: 'text-green-700', productCount: 150 },
  { id: 2, name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', color: 'bg-blue-100', textColor: 'text-blue-700', productCount: 85 },
  { id: 3, name: 'Snacks & Beverages', image: 'https://images.unsplash.com/photo-1560963689-ba5f0c9ca2f8?w=400&h=400&fit=crop', color: 'bg-orange-100', textColor: 'text-orange-700', productCount: 200 },
  { id: 4, name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', color: 'bg-pink-100', textColor: 'text-pink-700', productCount: 120 },
  { id: 5, name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', color: 'bg-purple-100', textColor: 'text-purple-700', productCount: 180 },
  { id: 6, name: 'Baby Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', color: 'bg-yellow-100', textColor: 'text-yellow-700', productCount: 95 },
];

const AllCategories = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 text-sm mt-1">Shop by category</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <Package className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-700">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}</div>
            <div className="text-xs text-green-600">Products</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-700">Free</div>
            <div className="text-xs text-blue-600">Delivery</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-700">10 min</div>
            <div className="text-xs text-purple-600">Delivery</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {category.productCount} items
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default AllCategories;
