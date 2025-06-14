
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const categories = [
  { id: 1, name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=200&h=200&fit=crop&crop=center', color: 'from-green-400 to-emerald-500' },
  { id: 2, name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&crop=center', color: 'from-blue-400 to-cyan-500' },
  { id: 3, name: 'Snacks & Beverages', image: 'https://images.unsplash.com/photo-1560963689-ba5f0c9ca2f8?w=200&h=200&fit=crop&crop=center', color: 'from-orange-400 to-amber-500' },
  { id: 4, name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&crop=center', color: 'from-pink-400 to-rose-500' },
  { id: 5, name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center', color: 'from-purple-400 to-indigo-500' },
  { id: 6, name: 'Baby Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop&crop=center', color: 'from-yellow-400 to-orange-500' },
];

interface CategoryGridProps {
  onCategorySelect: (categoryId: number) => void;
}

const CategoryGrid = ({ onCategorySelect }: CategoryGridProps) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link 
          to="/categories" 
          className="flex items-center text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm transition-colors duration-200 group"
        >
          <span>View All</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.id}`}
            onClick={() => onCategorySelect(category.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className={`bg-gradient-to-br ${category.color} rounded-xl p-3 sm:p-4 lg:p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 aspect-square flex flex-col justify-center items-center`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-3 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-medium text-xs sm:text-sm lg:text-base leading-tight text-center">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
