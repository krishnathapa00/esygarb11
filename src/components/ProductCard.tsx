
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string;
  discount?: number;
  deliveryTime: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  cartQuantity: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const ProductCard = ({
  product,
  onAddToCart,
  cartQuantity,
  onUpdateQuantity,
}: ProductCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 w-full group relative">
      <Link to={`/product/${product.id}`} className="block group">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl shadow-sm"
          />
          {/* Discount Badge */}
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-400 text-white px-1.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-xl shadow">
              {product.discount}% OFF
            </Badge>
          )}
          {/* DeliveryTime */}
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-md px-1.5 py-0.5 shadow-sm border border-gray-100">
            <span className="text-[10px] sm:text-xs font-bold text-green-600">{product.deliveryTime}</span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="px-3 pt-2 pb-3 flex flex-col justify-between min-h-[130px]">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-xs sm:text-base leading-tight line-clamp-2 hover:text-green-600 transition-colors min-h-[2.1rem] sm:min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-row items-center gap-2 mt-1 mb-2">
          <span className="text-[11px] sm:text-xs text-gray-500">{product.weight}</span>
        </div>
        {/* Align price and controls in a row */}
        <div className="flex items-end justify-between gap-2 mt-2">
          {/* Price Block with Original Price Above Discounted Price */}
          <div className="flex flex-col items-start">
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-red-400 line-through mb-0.5">
                Rs{product.originalPrice}
              </span>
            )}
            <span className="font-extrabold text-green-700 text-base sm:text-lg">
              Rs{product.price}
            </span>
          </div>
          {/* Add to Cart Section */}
          <div className="flex-shrink-0">
            {cartQuantity === 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold h-8 sm:h-9 px-4 sm:px-6 rounded-lg shadow transition-all duration-200"
              >
                ADD
              </Button>
            ) : (
              <div className="flex items-center justify-between bg-green-600 rounded-lg px-1.5 py-1 shadow space-x-1">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateQuantity(product.id, cartQuantity - 1);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 sm:w-8 sm:h-8 !bg-transparent text-white hover:bg-green-700 rounded text-base font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </Button>
                <span className="font-bold text-white text-sm sm:text-base px-2">{cartQuantity}</span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateQuantity(product.id, cartQuantity + 1);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 sm:w-8 sm:h-8 !bg-transparent text-white hover:bg-green-700 rounded text-base font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Subtle ring on hover */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:ring-[2.5px] group-hover:ring-green-400 transition-all duration-200" />
    </div>
  );
};

export default ProductCard;

