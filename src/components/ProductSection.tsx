
import React from 'react';
import ProductCard, { Product } from './ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  cart: Record<number, number>;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const ProductSection = ({ title, products, onAddToCart, cart, onUpdateQuantity }: ProductSectionProps) => {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
        <button className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {products.slice(0, 12).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            cartQuantity={cart[product.id] || 0}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
