import { useNavigate } from "react-router-dom";
import ProductCard, { Product } from "./ProductCard";
import { ChevronRight } from "lucide-react";

interface ProductSectionProps {
  title: string;
  slug: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  cartQuantityGetter: (productId: number) => number;
}

const ProductSection = ({
  title,
  slug,
  products,
  onAddToCart,
  onUpdateQuantity,
  cartQuantityGetter,
}: ProductSectionProps) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/subcategories/${slug}`);
  };

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        <button
          onClick={handleViewAll}
          className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm"
        >
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            cartQuantity={cartQuantityGetter(product.id)}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
