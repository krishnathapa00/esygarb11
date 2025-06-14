
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  cart: Record<number, number>;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const ProductSection = ({ title, products, onAddToCart, cart, onUpdateQuantity }: ProductSectionProps) => {
  const getCategoryId = (categoryName: string) => {
    const categoryMap: Record<string, number> = {
      'Fruits & Vegetables': 1,
      'Dairy & Eggs': 2,
      'Snacks & Beverages': 3,
      'Personal Care': 4,
      'Home & Kitchen': 5,
      'Baby Care': 6,
    };
    return categoryMap[categoryName] || 1;
  };

  return (
    <section className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h3>
        <Link 
          to={`/categories/${getCategoryId(title)}`}
          className="flex items-center text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm transition-colors duration-200 group"
        >
          <span>View All</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>
      
      {/* Horizontal Scrolling Container */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide scroll-smooth">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-36 sm:w-44 lg:w-48">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                cartQuantity={cart[product.id] || 0}
                onUpdateQuantity={onUpdateQuantity}
              />
            </div>
          ))}
        </div>
        
        {/* Gradient fade effect for better UX */}
        <div className="absolute top-0 right-0 w-6 sm:w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

export default ProductSection;
