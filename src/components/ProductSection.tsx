import ProductCard, { Product } from "./ProductCard";
import { ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Show only 3 products on mobile for horizontal scroll
  const displayProducts = isMobile ? products.slice(0, 3) : products.slice(0, 12);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm transition-colors">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className={`${
        isMobile 
          ? "flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
      }`}>
        {displayProducts.map((product) => (
          <div key={product.id} className={isMobile ? "flex-shrink-0 w-40" : ""}>
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              cartQuantity={cartQuantityGetter(product.id)}
              onUpdateQuantity={onUpdateQuantity}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
