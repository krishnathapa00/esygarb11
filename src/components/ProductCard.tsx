
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

const ProductCard = ({ product, onAddToCart, cartQuantity, onUpdateQuantity }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 w-full group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discount && (
            <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 hover:bg-red-500 text-white text-[10px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/95 backdrop-blur-sm rounded px-1 sm:px-1.5 py-0.5">
            <span className="text-[10px] sm:text-xs font-medium text-green-600">{product.deliveryTime}</span>
          </div>
        </div>
      </Link>
      
      <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 hover:text-green-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-[10px] sm:text-xs text-gray-500">{product.weight}</p>
        
        {/* Price and Add Button Row - Enhanced for mobile visibility */}
        <div className="flex items-center justify-between pt-1 gap-1">
          {/* Left side - Price - Improved mobile visibility */}
          <div className="flex flex-col items-start flex-1 min-w-0">
            <div className="flex items-baseline gap-1 w-full">
              <span className="font-bold text-gray-900 text-sm sm:text-base leading-none">
                Rs{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through leading-none">
                  Rs{product.originalPrice}
                </span>
              )}
            </div>
          </div>
          
          {/* Right side - Add Button */}
          <div className="flex-shrink-0">
            {cartQuantity === 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm font-semibold h-7 sm:h-8 px-3 sm:px-4 rounded-md sm:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                ADD
              </Button>
            ) : (
              <div className="flex items-center justify-between bg-green-600 rounded-md sm:rounded-lg px-1 sm:px-2 py-1">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateQuantity(product.id, cartQuantity - 1);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-white hover:bg-green-700 rounded text-sm font-medium min-w-[24px] sm:min-w-[28px]"
                >
                  −
                </Button>
                <span className="font-medium text-white text-xs sm:text-sm px-2 min-w-[16px] text-center">{cartQuantity}</span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateQuantity(product.id, cartQuantity + 1);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-white hover:bg-green-700 rounded text-sm font-medium min-w-[24px] sm:min-w-[28px]"
                >
                  +
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
