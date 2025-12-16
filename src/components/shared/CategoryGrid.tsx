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

      {/* Mobile */}
      <div className="block md:hidden space-y-2">
        {(() => {
          const rows: any[] = [];
          const firstRow = orderedCategories.slice(0, 2);
          if (firstRow.length) rows.push(firstRow);
          const remaining = orderedCategories.slice(2);
          for (let i = 0; i < remaining.length; i += 3) {
            const rowItems = remaining.slice(i, i + 3);
            // fill with nulls if less than 3
            while (rowItems.length < 3) rowItems.push(null);
            rows.push(rowItems);
          }

          return rows.map((row, rowIdx) => (
            <div key={rowIdx} className={`grid grid-cols-${row.length} gap-2`}>
              {row.map((category, idx) =>
                category ? (
                  <Link
                    key={category.id}
                    to={`/subcategories/${category.slug}`}
                    onClick={() => onCategorySelect(category.id)}
                    onMouseEnter={() => prefetchSubcategories(category.id)}
                    className="group cursor-pointer"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square relative">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <h3 className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white font-semibold  text-xs sm:text-sm md:text-base drop-shadow-lg text-center">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                ) : (
                  <div key={`empty-${idx}`} />
                )
              )}
            </div>
          ));
        })()}
      </div>

      {/* Desktop: Existing grid */}
      <div className="hidden md:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {orderedCategories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            to={`/subcategories/${category.slug}`}
            onClick={() => onCategorySelect(category.id)}
            onMouseEnter={() => prefetchSubcategories(category.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square relative group">
              <img
                src={category.image_url}
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
