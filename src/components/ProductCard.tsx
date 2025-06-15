
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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 w-full">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
          {product.discount && (
            <Badge className="absolute top-1.5 left-1.5 bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
              {product.discount}%
            </Badge>
          )}
        </div>
      </Link>
      
      <div className="p-2 sm:p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mb-2">{product.weight}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 text-sm">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="text-xs text-green-600 font-medium">{product.deliveryTime}</span>
        </div>
        
        {cartQuantity === 0 ? (
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm h-7 sm:h-8 font-medium rounded transition-colors"
          >
            ADD
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-green-50 rounded px-1 py-1">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-green-600 hover:bg-green-100 rounded text-sm font-bold"
            >
              −
            </Button>
            <span className="font-semibold text-green-600 text-sm">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-green-600 hover:bg-green-100 rounded text-sm font-bold"
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
