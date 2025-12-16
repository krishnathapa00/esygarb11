import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/shared";
import ProductCard from "@/components/shared/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/hooks/useProducts";
import { useCartActions } from "@/hooks/useCart";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { data: products = [], isLoading, isError } = useProducts();
  const [searchQuery, setSearchQuery] = useState(query);
  const { handleAddToCart, getCartQuantity, handleUpdateQuantity } =
    useCartActions();

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const queryLower = searchQuery.toLowerCase();

    const exactMatches = products.filter(
      (product: Product) => product.name.toLowerCase() === queryLower
    );

    const otherMatches = products.filter(
      (product: Product) =>
        product.name.toLowerCase().includes(queryLower) ||
        product.subcategory?.toLowerCase().includes(queryLower) ||
        product.description?.toLowerCase().includes(queryLower)
    );

    const matchedSubcategories = new Set(
      exactMatches
        .concat(otherMatches)
        .map((p) => p.subcategory)
        .filter(Boolean)
    );

    const expandedResults = products.filter(
      (product) =>
        matchedSubcategories.has(product.subcategory) ||
        exactMatches.includes(product)
    );

    const sortedResults = [
      ...exactMatches,
      ...expandedResults.filter((p) => !exactMatches.includes(p)),
    ];

    return sortedResults;
  }, [products, searchQuery]);

  return (
    <>
      <Header />

      <div className="px-4 pt-24 sm:pt-20 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            Loading products...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load products.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No products found for "{searchQuery}"
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Search results for "{searchQuery}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  cartQuantity={getCartQuantity(product.id)}
                  onUpdateQuantity={(id, qty) => handleUpdateQuantity(id, qty)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SearchResults;
