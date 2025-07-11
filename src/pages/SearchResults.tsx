import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/hooks/useProducts";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { data: products = [], isLoading, isError } = useProducts();
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products.filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery)
    );
  }, [products, searchQuery]);

  return (
    <>
      <Header />

      <div className="p-4 max-w-7xl mx-auto">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => console.log("Add to cart", product)}
                cartQuantity={0}
                onUpdateQuantity={(id, qty) =>
                  console.log("Update quantity", id, qty)
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;
