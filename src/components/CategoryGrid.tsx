import React from "react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

const CategoryGrid = ({ onCategorySelect }: { onCategorySelect: (categoryId: number) => void }) => {
  const { data: categories = [] } = useCategories();

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
        <Link
          to="/categories"
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onCategorySelect(category.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div
              className={`bg-gradient-to-br ${category.gradient} rounded-xl p-2 md:p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 aspect-square flex flex-col justify-center items-center min-h-[70px] md:min-h-[100px]`}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-medium text-xs md:text-sm leading-tight text-center">
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