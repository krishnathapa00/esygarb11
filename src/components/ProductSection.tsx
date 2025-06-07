
import React from 'react';
import ProductCard, { Product } from './ProductCard';

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
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button className="text-green-600 hover:text-green-700 font-medium text-sm">
          View All
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-40 md:w-48">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              cartQuantity={cart[product.id] || 0}
              onUpdateQuantity={onUpdateQuantity}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
