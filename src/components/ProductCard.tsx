
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 w-40 md:w-52 flex-shrink-0">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 md:h-40 object-cover hover:scale-105 transition-transform duration-200"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-1">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            {product.deliveryTime}
          </div>
        </div>
      </Link>
      
      <div className="p-3 md:p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 line-clamp-2 leading-tight hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs md:text-sm mb-3">{product.weight}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 text-sm md:text-base">Rs {product.price}</span>
            {product.originalPrice && (
              <span className="text-xs md:text-sm text-gray-400 line-through">
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-lg text-sm md:text-base h-9 md:h-10 font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            ADD TO CART
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-green-50 rounded-lg p-1">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 border-green-200 text-green-600 hover:bg-green-100 rounded-lg font-bold text-lg"
            >
              −
            </Button>
            <span className="font-bold text-green-600 mx-3 text-base">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 border-green-200 text-green-600 hover:bg-green-100 rounded-lg font-bold text-lg"
            >
              +
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
