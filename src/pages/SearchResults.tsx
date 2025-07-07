import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard"; // adjust path

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: "Fresh Bananas",
        price: 40,
        originalPrice: 50,
        discount: 20,
        weight: "1 kg",
        deliveryTime: "10 mins",
        category: "Fruits",
        image:
          "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600",
      },
      {
        id: 2,
        name: "Fresh Tomatoes",
        price: 25,
        originalPrice: 30,
        discount: 15,
        weight: "500 gm",
        deliveryTime: "15 mins",
        category: "Vegetables",
        image:
          "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600",
      },
    ];

    const fetchResults = () => {
      setLoading(true);
      const filtered = mockProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      setResults(filtered);
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <>
      <Header
        cartItems={0}
        onCartClick={() => {}}
        searchQuery={query}
        onSearchChange={() => {}}
      />

      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => console.log("Add to cart", product)}
                cartQuantity={0}
                onUpdateQuantity={(productId, qty) =>
                  console.log("Update qty", productId, qty)
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
