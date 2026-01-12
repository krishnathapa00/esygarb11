import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/shared";
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
import { useQuery } from "@tanstack/react-query";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  category_ids?: number[];
  category_names?: string[];
  product_ids?: number[];
}

const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isManualPromo, setIsManualPromo] = useState(false);

  const [orderCount, setOrderCount] = useState<number | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  const validatePromoAgainstCart = (promo: PromoCode | null) => {
    if (!promo) return false;

    // Check min order amount
    if (promo.min_order_amount && totalPrice < promo.min_order_amount) {
      return false;
    }

    // Check product_ids if any
    if (
      promo.product_ids &&
      promo.product_ids.length > 0 &&
      !cart.some((item) => promo.product_ids!.includes(item.id))
    ) {
      return false;
    }

    // Check category_ids if any
    if (
      promo.category_ids &&
      promo.category_ids.length > 0 &&
      !cart.some((item) => promo.category_ids!.includes(item.category_id))
    ) {
      return false;
    }

    return true;
  };

  // Consolidated promo validation - single useEffect to prevent race conditions
  useEffect(() => {
    if (!appliedPromo) return;

    const isValid = validatePromoAgainstCart(appliedPromo);

    if (!isValid) {
      toast({
        title: "Promo code removed",
        description: "Your cart no longer meets the promo conditions.",
        variant: "destructive",
      });
      handleRemovePromo();
    }
  }, [cart, totalPrice, appliedPromo]); // Consolidated dependencies

  const { data: deliveryConfig } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const baseDeliveryFee = deliveryConfig?.delivery_fee ?? 10;

  const FREE_DELIVERY_THRESHOLD = 400;
  const remainingForFreeDelivery =
    totalPrice < FREE_DELIVERY_THRESHOLD
      ? FREE_DELIVERY_THRESHOLD - totalPrice
      : 0;

  const hasFreeDelivery =
    orderCount === 0 || totalPrice >= FREE_DELIVERY_THRESHOLD;

  const deliveryFee = hasFreeDelivery ? 0 : baseDeliveryFee;

  const discountAmount = promoDiscount;
  const totalAmount = totalPrice + deliveryFee - discountAmount;

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) return;

      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        return;
      }

      setOrderCount(count || 0);
    };

    fetchOrderCount();
  }, [user]);

  useEffect(() => {
    if (appliedPromo && totalPrice < appliedPromo.min_order_amount) {
      toast({
        title: `Promo code removed - subtotal fell below Rs ${appliedPromo.min_order_amount}`,
        variant: "destructive",
      });
      handleRemovePromo();
    }
  }, [totalPrice, appliedPromo]);

  // Persist promo in session storage
  useEffect(() => {
    if (appliedPromo) {
      sessionStorage.setItem("applied_promo", JSON.stringify(appliedPromo));
      sessionStorage.setItem("promo_discount", String(promoDiscount));
    } else {
      sessionStorage.removeItem("applied_promo");
      sessionStorage.removeItem("promo_discount");
    }
  }, [appliedPromo, promoDiscount]);

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
        .single<PromoCode>();

      if (error || !promo) {
        toast({ title: "Invalid promo code", variant: "destructive" });
        return;
      }

      // Check if promo is expired
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        toast({ title: "Promo code has expired", variant: "destructive" });
        return;
      }

      // Check if usage limit exceeded
      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        toast({
          title: "Promo code usage limit reached",
          variant: "destructive",
        });
        return;
      }

      // CHECK IF USER HAS ALREADY USED THIS PROMO CODE
      const { data: usage, error: usageError } = await supabase
        .from("promo_code_usage")
        .select("*")
        .eq("user_id", user?.id)
        .eq("promo_code_id", promo.id)
        .single();

      if (usage) {
        toast({
          title: "Promo code already used",
          description: "You can only use this promo code once.",
          variant: "destructive",
        });
        return;
      }

      promo.category_ids = promo.category_ids?.map(Number) || [];
      promo.product_ids = promo.product_ids?.map(Number) || [];

      if (
        promo.category_ids.length > 0 &&
        !cart.some((item) => promo.category_ids.includes(item.category_id))
      ) {
        toast({
          title: "Promo code not applicable",
          description: `Add eligible items to your cart.`,
          variant: "destructive",
        });
        return;
      }

      if (
        promo.product_ids.length > 0 &&
        !cart.some((item) => promo.product_ids.includes(item.id))
      ) {
        toast({
          title: "Promo code not applicable",
          description: `Add eligible products to your cart.`,
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

      // CALCULATE DISCOUNT
      let discount = 0;

      if (promo.discount_type === "percentage") {
        discount = (totalPrice * promo.discount_value) / 100;
        if (promo.max_discount_amount) {
          discount = Math.min(discount, promo.max_discount_amount);
        }
      } else if (promo.discount_type === "fixed") {
        discount = promo.discount_value;
      }

      discount = Math.min(discount, totalPrice);

      // APPLY PROMO LOCALLY
      setAppliedPromo(promo);
      setPromoDiscount(discount);
      setIsManualPromo(true);

      toast({ title: `Promo code applied! Saved Rs ${discount}` });
    } catch (error) {
      toast({ title: "Error applying promo code", variant: "destructive" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode("");
    setIsManualPromo(false);
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

        <div className="container mx-auto px-2 pb-20 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-2 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
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

                      <p className="text-green-700 text-xs font-medium mt-2">
                        {appliedPromo.discount_type === "percentage"
                          ? `${appliedPromo.discount_value}% OFF${
                              appliedPromo.max_discount_amount
                                ? ` up to Rs ${appliedPromo.max_discount_amount}`
                                : ""
                            }`
                          : `Flat Rs ${appliedPromo.discount_value} OFF`}

                        {appliedPromo.min_order_amount
                          ? ` on orders above Rs ${appliedPromo.min_order_amount}`
                          : ""}

                        {appliedPromo.category_names?.length
                          ? ` on selected categories`
                          : ""}
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
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      disabled={cart.length === 0 || !user}
                      className={`flex-1 px-2 py-2 border rounded-lg focus:outline-none text-sm ${
                        cart.length === 0 || !user
                          ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                          : "border-gray-300 focus:ring-2 focus:ring-green-500"
                      }`}
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      disabled={cart.length === 0 || !user}
                      className={`px-4 py-2 border-green-200 text-sm ${
                        cart.length === 0 || !user
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-green-50"
                      }`}
                    >
                      Apply
                    </Button>
                  </div>
                  {(cart.length === 0 || !user) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {!user
                        ? "Please login to apply promo codes."
                        : "Add items to your cart to use promo codes."}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-3 shadow-sm sticky top-24">
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
                {deliveryFee === 0 ? (
                  orderCount === 0 ? (
                    <p className="text-xs text-green-600">
                      Enjoy free delivery on your first order!
                    </p>
                  ) : (
                    <p className="text-xs text-green-600">
                      Free delivery on orders of Rs 200 or more!
                    </p>
                  )
                ) : (
                  <p className="text-xs text-gray-500">
                    Rs {baseDeliveryFee} delivery fee applies.
                  </p>
                )}

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-Rs {promoDiscount}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold text-base lg:text-lg">
                    <span>Total</span>
                    <span>Rs {totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Button */}
              <div className="hidden md:block space-y-2">
                {!hasFreeDelivery && remainingForFreeDelivery > 0 && (
                  <p className="text-sm text-orange-600 text-center font-medium">
                    To Get Free Delivery Add Items Worth Rs{" "}
                    {remainingForFreeDelivery}
                  </p>
                )}

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-md"
                >
                  Proceed to Checkout
                </Button>
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-left">
                  <p className="text-[11px] font-semibold text-gray-800 tracking-wide">
                    CANCELLATION POLICY
                  </p>

                  <p className="text-[11px] text-gray-600 leading-snug mt-1">
                    Orders can be cancelled within{" "}
                    <span className="font-medium text-gray-800">1 minute</span>{" "}
                    of placement. After this, the order may already be
                    processed.
                  </p>

                  <p className="text-[11px] text-gray-600 mt-1">
                    Need help?{" "}
                    <Link
                      to="/support"
                      className="font-medium text-green-600 hover:underline"
                    >
                      Contact EsyGrab Support
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Checkout Bar */}
            <div className="md:hidden bg-white border-t shadow-lg p-4 z-50 space-y-2">
              {!hasFreeDelivery && remainingForFreeDelivery > 0 && (
                <p className="text-sm text-orange-600 text-center font-medium">
                  To Get Free Delivery Add Items Worth Rs{" "}
                  {remainingForFreeDelivery}
                </p>
              )}

              <Button
                onClick={handleProceedToCheckout}
                className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-md"
              >
                Proceed to Checkout
              </Button>
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-left">
                <p className="text-[11px] font-semibold text-gray-800 tracking-wide">
                  CANCELLATION POLICY
                </p>

                <p className="text-[11px] text-gray-600 leading-snug mt-1">
                  Orders can be cancelled within{" "}
                  <span className="font-medium text-gray-800">1 minute</span> of
                  placement. After this, the order may already be processed.
                </p>

                <p className="text-[11px] text-gray-600 mt-1">
                  Need help?{" "}
                  <Link
                    to="/support"
                    className="font-medium text-green-600 hover:underline"
                  >
                    Contact EsyGrab Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
