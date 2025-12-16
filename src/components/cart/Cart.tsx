import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Truck, Clock } from "lucide-react";
import { Product } from "../shared/ProductCard";

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const Cart = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartProps) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = totalPrice > 200 ? 0 : 20;
  const finalTotal = totalPrice + deliveryFee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              My Cart ({totalItems} items)
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Delivery Info */}
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Delivery in 10 mins
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400">
                  Add items to get started
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.weight}</p>
                    <p className="font-semibold text-sm">Rs.{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                    >
                      -
                    </Button>
                    <span className="font-medium text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>Rs.{deliveryFee}</span>
                </div>
                {deliveryFee === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Free delivery on orders above Rs200
                  </Badge>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>Rs.{finalTotal}</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Clock className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fix missing import
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 6H2m5 7l-1.5 6h12l-1.5-6m-9 6h.01m8-.01h.01"
    />
  </svg>
);

export default Cart;
