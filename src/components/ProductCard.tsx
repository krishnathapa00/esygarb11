
import React from 'react';
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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
        />
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 rounded-full">
            {product.discount}% OFF
          </Badge>
        )}
        <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          {product.deliveryTime}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs mb-2">{product.weight}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        {cartQuantity === 0 ? (
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl"
            size="sm"
          >
            ADD
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 border-green-200 text-green-600 hover:bg-green-50 rounded-full"
            >
              -
            </Button>
            <span className="font-semibold text-green-600 mx-3">{cartQuantity}</span>
            <Button
              onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 border-green-200 text-green-600 hover:bg-green-50 rounded-full"
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
