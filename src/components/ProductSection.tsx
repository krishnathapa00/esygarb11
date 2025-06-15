
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
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        <button className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm md:text-base transition-colors">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              cartQuantity={cart[product.id] || 0}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
