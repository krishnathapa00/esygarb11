
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';

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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-24 sm:h-28 lg:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <Badge className="absolute top-1.5 left-1.5 bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0.5">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-1.5 right-1.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
            {product.deliveryTime}
          </div>
        </div>
      </Link>
      
      <div className="p-2 sm:p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mb-2">{product.weight}</p>
        
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 text-sm sm:text-base">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-md text-xs sm:text-sm h-7 sm:h-8 font-medium transition-all duration-200"
          >
            ADD TO CART
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-green-50 rounded-md p-1">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-green-600 hover:bg-green-100 rounded-full"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-semibold text-green-600 mx-2 text-sm sm:text-base min-w-[20px] text-center">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 sm:w-7 sm:h-7 p-0 text-green-600 hover:bg-green-100 rounded-full"
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
