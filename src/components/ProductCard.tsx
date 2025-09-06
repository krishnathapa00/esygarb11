import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  categoryId: number;
  stock_quantity: number;
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 w-full group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {product.discount}% OFF
            </Badge>
          )}
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded px-1.5 py-0.5">
            <span className="text-xs font-medium text-green-600">
              {product.deliveryTime}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-gray-500">{product.weight}</p>

        {/* Price and Add Button Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left side - Price */}
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-gray-900 text-sm">
              Rs{product.price}
            </span>
            {product.price > 0 && product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                Rs{product.originalPrice}
              </span>
            )}
          </div>

          {/* Right side - Add/Quantity Button */}
          {/* Right side - Add/Quantity Button */}
          <div className="flex-shrink-0 min-w-[60px] sm:min-w-[70px]">
            {product.stock_quantity === 0 ? (
              <span className="text-red-600 text-[10px] sm:text-xs font-semibold">
                Out of Stock
              </span>
            ) : cartQuantity === 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
       text-white border-0 text-[10px] sm:text-xs font-semibold 
       h-7 sm:h-7 px-2 sm:px-2 rounded-lg 
       transition-all duration-200 shadow-sm hover:shadow-md w-full"
              >
                ADD
              </Button>
            ) : (
              <div className="flex items-center justify-between bg-green-600 rounded-lg px-1 sm:px-2 py-1 w-full">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateQuantity(product.id, cartQuantity - 1);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-5 h-5 sm:w-5 sm:h-5 p-0 text-white hover:bg-green-700 rounded text-[12px] sm:text-xs font-medium"
                >
                  −
                </Button>
                <span className="font-medium text-white text-[12px] sm:text-xs px-1">
                  {cartQuantity}
                </span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    if (cartQuantity < product.stock_quantity) {
                      onUpdateQuantity(product.id, cartQuantity + 1);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  disabled={cartQuantity >= product.stock_quantity}
                  className="w-5 h-5 sm:w-5 sm:h-5 p-0 text-white hover:bg-green-700 disabled:opacity-50 rounded text-[12px] sm:text-xs font-medium"
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
