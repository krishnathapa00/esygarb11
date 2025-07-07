import React from "react";
import { ShoppingCart } from "lucide-react";

const EmptyCartView: React.FC = () => (
  <div className="text-center py-10">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <ShoppingCart className="h-8 w-8 text-gray-400" />
    </div>
    <p className="text-gray-600 font-medium">Your cart is empty</p>
    <p className="text-sm text-gray-400">Add items to start shopping</p>
  </div>
);

export default EmptyCartView;
