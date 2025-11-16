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
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square relative group">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              <h3 className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white font-semibold text-sm md:text-base drop-shadow-lg text-center">
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
