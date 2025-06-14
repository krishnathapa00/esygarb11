
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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-24 object-cover"
          />
          {product.discount && (
            <Badge className="absolute top-1 left-1 bg-red-500 hover:bg-red-500 text-white text-xs px-1 py-0">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-1 right-1 bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs font-medium">
            {product.deliveryTime}
          </div>
        </div>
      </Link>
      
      <div className="p-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mb-2">{product.weight}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-md text-xs h-8"
          >
            ADD
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity - 1);
              }}
              variant="outline"
              size="sm"
              className="w-6 h-6 p-0 border-green-200 text-green-600 hover:bg-green-50 rounded-full"
            >
              -
            </Button>
            <span className="font-semibold text-green-600 mx-2 text-sm">{cartQuantity}</span>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUpdateQuantity(product.id, cartQuantity + 1);
              }}
              variant="outline"
              size="sm"
              className="w-6 h-6 p-0 border-green-200 text-green-600 hover:bg-green-50 rounded-full"
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
