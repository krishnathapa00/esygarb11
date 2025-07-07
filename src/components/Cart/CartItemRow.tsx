import React from "react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/contexts/CartContext";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onRemoveItem(item.id);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
      <img
        src={item.image}
        alt={item.name}
        className="w-12 h-12 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-medium text-sm">{item.name}</h3>
        <p className="text-xs text-gray-500">{item.weight}</p>
        <p className="font-semibold text-sm">Rs{item.price}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleDecrement}
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
          onClick={handleIncrement}
          variant="outline"
          size="sm"
          className="w-6 h-6 p-0"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default CartItemRow;
