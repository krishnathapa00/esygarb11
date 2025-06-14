
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Star } from 'lucide-react';

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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-24 sm:h-28 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.discount && (
            <Badge className="absolute top-1 left-1 bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0.5 font-semibold">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-1 right-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
            {product.deliveryTime}
          </div>
        </div>
      </Link>
      
      <div className="p-2 sm:p-3 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-xs mb-1">{product.weight}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600">4.2</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2 mt-auto">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 text-sm sm:text-base">Rs {product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                Rs {product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        {cartQuantity === 0 ? (
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-md text-xs sm:text-sm h-7 sm:h-8 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ADD TO CART
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-green-50 rounded-md p-1.5 border border-green-200">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-green-600 hover:bg-green-100 rounded-full border border-green-300"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-bold text-green-600 mx-2 text-sm min-w-[20px] text-center">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-green-600 hover:bg-green-100 rounded-full border border-green-300"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
