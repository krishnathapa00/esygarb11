import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [orderCount, setOrderCount] = useState<number | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasExpensiveItem = cart.some((item) => item.price > 200);
  const deliveryFee = hasExpensiveItem ? 0 : 10;

  const discountAmount = promoDiscount;
  const totalAmount = totalPrice + deliveryFee - discountAmount;

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching order count:", error);
        return;
      }

      setOrderCount(data.length); // or data?.count
    };

    fetchOrderCount();
  }, [user]);

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
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !promo) {
        toast({ title: "Invalid promo code", variant: "destructive" });
        return;
      }

      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        toast({ title: "Promo code has expired", variant: "destructive" });
        return;
      }

      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        toast({
          title: "Promo code usage limit reached",
          variant: "destructive",
        });
        return;
      }

      if (promo.min_order_amount && totalPrice < promo.min_order_amount) {
        toast({
          title: `Minimum order amount is Rs ${promo.min_order_amount}`,
          variant: "destructive",
        });
        return;
      }

      let discount = 0;
      if (promo.discount_type === "percentage") {
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
      console.error("Error applying promo:", error);
      toast({ title: "Error applying promo code", variant: "destructive" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode("");
    toast({ title: "Promo code removed" });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/checkout", {
      state: {
        showProfileModal: true,
        appliedPromo,
        promoDiscount,
      },
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 max-w-md mx-auto text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some products to get started!
          </p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-4 max-w-6xl mx-auto lg:px-8">
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

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.weight}</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      Rs {item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
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

          {/* Right Column */}
          <div className="mt-6 lg:mt-0 space-y-6">
            {/* Promo Code Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-600" />
                Promo Code
              </h3>

              {appliedPromo ? (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {appliedPromo.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Code: {appliedPromo.code}
                      </p>
                      <p className="text-xs text-green-600">
                        Discount: Rs {promoDiscount}
                      </p>
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
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    variant="outline"
                    className="px-4 py-2 border-green-200 hover:bg-green-50 text-sm"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span>Rs {totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>Rs {deliveryFee}</span>
                </div>
                {orderCount < 3 ? (
                  <p className="text-xs text-green-600">
                    Free delivery for your first {3 - orderCount} order
                    {3 - orderCount > 1 ? "s" : ""}!
                  </p>
                ) : hasExpensiveItem ? (
                  <p className="text-xs text-green-600">
                    Free delivery on items costing over Rs 200
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Rs 10 delivery fee applies after 3 free orders.
                  </p>
                )}
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-Rs {promoDiscount}</span>
                  </div>
                )}
                {deliveryFee === 0 && (
                  <p className="text-xs text-green-600">
                    Free delivery on orders over Rs 200!
                  </p>
                )}
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold text-base lg:text-lg">
                    <span>Total</span>
                    <span>Rs {totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Button */}
              <div className="hidden md:block">
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-md"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>

            {/* Mobile Sticky Checkout Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
              <Button
                onClick={handleProceedToCheckout}
                className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-md"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
