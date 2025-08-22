import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    const stored = localStorage.getItem("esygrab_user_location");
    if (stored) {
      const location = JSON.parse(stored);
      return location.address || "";
    }
    return "";
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = totalPrice > 200 ? 0 : 20;
  const discountAmount = promoDiscount;
  const totalAmount = totalPrice + deliveryFee - discountAmount;

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({ title: "Please enter a promo code", variant: "destructive" });
      return;
    }

    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        toast({ title: "Invalid promo code", variant: "destructive" });
        return;
      }

      // Check if promo is expired
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        toast({ title: "Promo code has expired", variant: "destructive" });
        return;
      }

      // Check usage limit
      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        toast({ title: "Promo code usage limit reached", variant: "destructive" });
        return;
      }

      // Check minimum order amount
      if (promo.min_order_amount && totalPrice < promo.min_order_amount) {
        toast({ 
          title: `Minimum order amount is Rs ${promo.min_order_amount}`, 
          variant: "destructive" 
        });
        return;
      }

      let discount = 0;
      if (promo.discount_type === 'percentage') {
        discount = (totalPrice * promo.discount_value) / 100;
        if (promo.max_discount_amount && discount > promo.max_discount_amount) {
          discount = promo.max_discount_amount;
        }
      } else {
        discount = promo.discount_value;
      }

      setAppliedPromo(promo);
      setPromoDiscount(discount);
      toast({ title: `Promo code applied! Saved Rs ${discount}` });
    } catch (error) {
      console.error('Error applying promo:', error);
      toast({ title: "Error applying promo code", variant: "destructive" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode('');
    toast({ title: "Promo code removed" });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      // Redirect to auth page if not authenticated
      navigate('/auth');
      return;
    }

    // User is authenticated, proceed to checkout
    navigate('/checkout');
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

          {/* Promo Code Section */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              Promo Code
            </h3>
            
            {appliedPromo ? (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">{appliedPromo.name}</p>
                    <p className="text-xs text-green-600">Code: {appliedPromo.code}</p>
                    <p className="text-xs text-green-600">Discount: Rs {promoDiscount}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemovePromo}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                />
                <Button 
                  onClick={handleApplyPromo}
                  variant="outline"
                  className="px-3 py-2 border-green-200 hover:bg-green-50 text-sm whitespace-nowrap"
                >
                  Apply
                </Button>
              </div>
            )}
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
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-Rs {promoDiscount}</span>
                </div>
              )}
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

            <Button 
              onClick={handleProceedToCheckout}
              className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white fixed bottom-20 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto z-50 md:mb-0"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;