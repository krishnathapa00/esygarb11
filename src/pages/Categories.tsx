
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 1, name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=400&fit=crop', color: 'from-green-400 to-emerald-500', productCount: 150 },
  { id: 2, name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', color: 'from-blue-400 to-cyan-500', productCount: 85 },
  { id: 3, name: 'Snacks & Beverages', image: 'https://images.unsplash.com/photo-1560963689-ba5f0c9ca2f8?w=400&h=400&fit=crop', color: 'from-orange-400 to-amber-500', productCount: 200 },
  { id: 4, name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', color: 'from-pink-400 to-rose-500', productCount: 120 },
  { id: 5, name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', color: 'from-purple-400 to-indigo-500', productCount: 180 },
  { id: 6, name: 'Baby Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', color: 'from-yellow-400 to-orange-500', productCount: 95 },
];

const AllCategories = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        cartItems={cartItems}
        onCartClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-3 hover:bg-white/50 transition-all duration-200">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Shop by Category</h1>
              <p className="text-gray-600 text-sm md:text-base">Discover our wide range of quality products</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}</div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-500">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">5-15</div>
                <div className="text-sm text-gray-500">Min Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="bg-white rounded-3xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Category Header with Gradient */}
                <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm p-3">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  
                  <h3 className="text-white font-bold text-xl mb-2 relative z-10">
                    {category.name}
                  </h3>
                  <p className="text-white/90 text-sm relative z-10">
                    {category.productCount} products available
                  </p>
                </div>
                
                {/* Category Footer */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Starting from</span>
                    <span className="text-lg font-bold text-gray-900">Rs 10</span>
                  </div>
                  <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-700 group-hover:w-full`}
                      style={{ width: `${Math.min((category.productCount / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
          <p className="text-green-100 mb-6">Browse all our products or contact our support team</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              View All Products
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Spacer */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default AllCategories;
