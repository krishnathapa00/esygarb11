import ProductCard, { Product } from "./ProductCard";
import { ChevronRight } from "lucide-react";

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  cartQuantityGetter: (productId: number) => number;
}

const ProductSection = ({
  title,
  products,
  onAddToCart,
  onUpdateQuantity,
  cartQuantityGetter,
}: ProductSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm transition-colors">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {products.slice(0, 12).map((product) => (
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
