
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 sm:h-36 lg:h-40 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-1 font-semibold">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
            {product.deliveryTime}
          </div>
        </div>
      </Link>
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 leading-tight hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-xs sm:text-sm mb-2">{product.weight}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
            <span className="text-xs sm:text-sm text-gray-600">4.2</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3 mt-auto">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 text-base sm:text-lg">Rs {product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-lg text-sm sm:text-base h-9 sm:h-10 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ADD TO CART
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-green-50 rounded-lg p-2 border border-green-200">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="ghost"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-green-600 hover:bg-green-100 rounded-full border border-green-300"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-green-600 mx-3 text-base sm:text-lg min-w-[24px] text-center">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="ghost"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-green-600 hover:bg-green-100 rounded-full border border-green-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
