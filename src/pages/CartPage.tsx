import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = totalPrice > 200 ? 0 : 20;
  const totalAmount = totalPrice + deliveryFee;

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 max-w-md mx-auto text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <Link to="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
      <Header />
      
      <div className="px-4 py-4 max-w-md mx-auto lg:max-w-4xl lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Shopping Cart
          </h1>
        </div>

        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Delivery Address Section */}
          <div className="lg:col-span-3 bg-white rounded-lg p-4 shadow-sm mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline" 
                className="flex items-center justify-center gap-2 p-3 h-auto border-green-200 hover:bg-green-50"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        localStorage.setItem("esygrab_user_location", JSON.stringify({
                          address: `${latitude}, ${longitude}`,
                          lat: latitude,
                          lng: longitude
                        }));
                        alert("Location detected successfully!");
                      },
                      (error) => {
                        console.error("Geolocation error:", error);
                        alert("Unable to detect location. Please try manual selection.");
                      }
                    );
                  } else {
                    alert("Geolocation is not supported by this browser.");
                  }
                }}
              >
                <MapPin className="h-4 w-4 text-green-600" />
                Auto-detect Location
              </Button>
              <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 p-3 h-auto border-green-200 hover:bg-green-50"
                onClick={() => window.open('/location-selector', '_blank')}
              >
                <Edit className="h-4 w-4 text-green-600" />
                Set Manually
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.weight}</p>
                    <p className="text-lg font-semibold text-green-600">Rs {item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm lg:h-fit sticky top-20">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span>Rs {totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs {deliveryFee}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-xs text-green-600">Free delivery on orders over Rs 200!</p>
              )}
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-semibold text-base lg:text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white mb-4 md:mb-0">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;