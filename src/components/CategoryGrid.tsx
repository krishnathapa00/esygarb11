import React from "react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { fetchSubcategories } from "@/hooks/useSubcategories";
import { useQueryClient } from "@tanstack/react-query";

const CategoryGrid = ({
  onCategorySelect,
}: {
  onCategorySelect: (categoryId: number) => void;
}) => {
  const { data: categories = [] } = useCategories();

  const queryClient = useQueryClient();

  const prefetchSubcategories = (categoryId: number) => {
    queryClient.prefetchQuery({
      queryKey: ["subcategories", categoryId],
      queryFn: () => fetchSubcategories(categoryId),
    });
  };

  // Reorder categories to put "Fruits & Vegetables" first
  const orderedCategories = [...categories].sort((a, b) => {
    if (
      a.name.toLowerCase().includes("fruits") ||
      a.name.toLowerCase().includes("vegetables")
    )
      return -1;
    if (
      b.name.toLowerCase().includes("fruits") ||
      b.name.toLowerCase().includes("vegetables")
    )
      return 1;
    return 0;
  });

  // Solid colors for categories, high contrast for white text
  const solidColors = [
    "bg-green-600", // green
    "bg-yellow-500", // yellow
    "bg-pink-500", // pink
    "bg-purple-600", // purple
    "bg-blue-600", // blue
    "bg-red-600", // red
  ];

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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {orderedCategories.slice(0, 6).map((category, idx) => (
          <Link
            key={category.id}
            to={`/subcategories/${category.slug}`}
            onClick={() => onCategorySelect(category.id)}
            onMouseEnter={() => prefetchSubcategories(category.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div
              className={`rounded-2xl p-4 text-center shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square flex flex-col justify-center items-center min-h-[90px] md:min-h-[110px] ${
                solidColors[idx % solidColors.length]
              }`}
            >
              <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 rounded-full overflow-hidden bg-white/30 backdrop-blur-md flex justify-center items-center">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-semibold text-sm md:text-base leading-tight text-center drop-shadow-md">
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

