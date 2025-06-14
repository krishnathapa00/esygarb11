
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
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm sm:text-base text-gray-600">Fresh and quality products</p>
        </div>
        <Link 
          to={`/categories/${getCategoryId(title)}`}
          className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base transition-colors duration-200 group bg-green-50 hover:bg-green-100 px-3 sm:px-4 py-2 rounded-lg"
        >
          <span>View All</span>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
      
      {/* Horizontal Scrolling Container */}
      <div className="relative">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
          {products.slice(0, 10).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-48 sm:w-56 lg:w-64">
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
        <div className="absolute top-0 right-0 w-8 sm:w-12 h-full bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

export default ProductSection;
