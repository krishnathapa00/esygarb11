
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-medium text-green-600">{product.deliveryTime}</span>
          </div>
        </div>
      </Link>
      
      <div className="p-3 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 font-medium">{product.weight}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-gray-900 text-base">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        <div className="pt-1">
          {cartQuantity === 0 ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-sm font-semibold h-9 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              ADD
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full bg-green-600 rounded-lg px-3 py-2 shadow-md">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onUpdateQuantity(product.id, cartQuantity - 1);
                }}
                variant="ghost"
                size="sm"
                className="w-7 h-7 p-0 text-white hover:bg-green-700 rounded-md text-lg font-bold"
              >
                −
              </Button>
              <span className="font-bold text-white text-sm px-2">{cartQuantity}</span>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onUpdateQuantity(product.id, cartQuantity + 1);
                }}
                variant="ghost"
                size="sm"
                className="w-7 h-7 p-0 text-white hover:bg-green-700 rounded-md text-lg font-bold"
              >
                +
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
