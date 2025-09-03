import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  WalletIcon,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import EsewaLogo from "../assets/payments/esewa.jpg";
import LocationDisplay from "@/components/LocationDisplay";
import KhaltiLogo from "../assets/payments/khalti.jpg";
import { useLocation } from "react-router-dom";

const Checkout = () => {
  const { cart, resetCart, mergeGuestCart } = useCart();
  const { user, loading } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const navigate = useNavigate();

  const location = useLocation();

  const [promoDiscount, setPromoDiscount] = useState(() => {
    if (location.state?.promoDiscount) return location.state.promoDiscount;
    const stored = sessionStorage.getItem("promo_discount");
    return stored ? Number(stored) : 0;
  });

  const [appliedPromo, setAppliedPromo] = useState(() => {
    if (location.state?.appliedPromo) return location.state.appliedPromo;
    const stored = sessionStorage.getItem("applied_promo");
    return stored ? JSON.parse(stored) : null;
  });

  const [orderCount, setOrderCount] = useState<number | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (appliedPromo) {
      sessionStorage.setItem("applied_promo", JSON.stringify(appliedPromo));
    } else {
      sessionStorage.removeItem("applied_promo");
    }
  }, [appliedPromo]);

  useEffect(() => {
    sessionStorage.setItem("promo_discount", String(promoDiscount));
  }, [promoDiscount]);

  const { data: deliveryConfig, isLoading: configLoading } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching delivery config:", error);
        return { delivery_fee: 15, delivery_partner_charge: 30 };
      }
      return data || { delivery_fee: 15, delivery_partner_charge: 30 };
    },
  });

  const baseDeliveryFee = deliveryConfig?.delivery_fee ?? 15;

  const deliveryFee =
    orderCount !== null && orderCount < 3
      ? 0
      : totalPrice > 200
      ? 0
      : baseDeliveryFee;

  const discount = promoDiscount ?? 0;
  const totalAmount = totalPrice + deliveryFee - discount;

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showProfileModal, setShowProfileModal] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Check if user needs to complete profile - only for new users with missing data
  const needsProfileCompletion =
    user && (!profile.full_name || !profile.phone) && !profile.address;

  useEffect(() => {
    const stored = localStorage.getItem("esygrab_user_location");
    setDeliveryAddress(stored ? JSON.parse(stored).address : "");
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to fetch order count:", error);
        return;
      }

      setOrderCount(data?.length || 0);
    };

    fetchOrderCount();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      localStorage.setItem("auth_redirect_url", "/checkout");
      navigate("/auth");
      return;
    }

    if (user && cart.length === 0) {
      const guestCart = localStorage.getItem("guest_cart");
      if (guestCart) {
        mergeGuestCart(JSON.parse(guestCart));
        localStorage.removeItem("guest_cart");
      }
    }

    // Only check for address **after it's loaded**
    if (user && deliveryAddress !== null) {
      if (needsProfileCompletion) {
        setShowProfileModal(true);
      } else if (!needsProfileCompletion && !deliveryAddress) {
        navigate("/map-location");
      }
    }
  }, [
    loading,
    user,
    cart,
    mergeGuestCart,
    needsProfileCompletion,
    deliveryAddress,
    navigate,
  ]);

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    const stored = localStorage.getItem("esygrab_user_location");
    if (stored) {
      const location = JSON.parse(stored);
      setDeliveryAddress(location.address || "");
      setShowAddressModal(true);
    }
  };

  const handleAddressConfirm = () => {
    setShowAddressModal(false);
  };

  const handleAddressChange = () => {
    navigate("/map-location");
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    if (needsProfileCompletion) {
      setShowProfileModal(true);
      return;
    }

    if (!deliveryAddress) {
      alert("Please set your delivery address.");
      return;
    }

    try {
      const orderNumber = `ORD${Date.now()}`;

      // Save order to Supabase database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          estimated_delivery: "10 mins",
          status: "pending",
          promo_code: appliedPromo?.code ?? null,
          promo_discount: discount,
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Save order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      const orderDetails = {
        orderId: orderNumber,
        items: cart,
        totalItems,
        totalAmount,
        deliveryAddress,
        estimatedDelivery: "10 mins",
        paymentMethod:
          paymentOptions.find((p) => p.id === selectedPayment)?.label || "",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      resetCart();
      sessionStorage.setItem("last_order", JSON.stringify(orderDetails));
      navigate("/order-confirmation", { state: orderDetails });
      sessionStorage.removeItem("applied_promo");
      sessionStorage.removeItem("promo_discount");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const paymentOptions = [
    {
      id: "cod",
      label: "Cash on Delivery (COD)",
      icon: <WalletIcon className="h-6 w-6" />,
    },
    { id: "khalti", label: "Khalti", icon: KhaltiLogo },
    { id: "esewa", label: "eSewa", icon: EsewaLogo },
    {
      id: "bank",
      label: "Bank Transfer",
      icon: <Banknote className="h-6 w-6" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:block hidden">
        <Header />
      </div>

      <div className="px-4 py-4 max-w-md mx-auto lg:max-w-4xl lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>

        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Address
              </h3>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Delivering to:
                    </p>
                    <LocationDisplay
                      address={deliveryAddress}
                      fallback="Please set delivery address"
                      className="text-sm text-green-700"
                      truncate={false}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddressChange} variant="outline" size="sm">
                Change Address
              </Button>
            </div>
            {/* Payment Method */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                <h3 className="text-base lg:text-lg font-semibold">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPayment === option.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPayment(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={option.id}
                        name="payment"
                        value={option.id}
                        checked={selectedPayment === option.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="text-green-600 w-4 h-4"
                      />
                      <div className="flex items-center space-x-2">
                        {typeof option.icon === "string" ? (
                          <img
                            src={option.icon}
                            alt={option.label}
                            className="h-6 w-6"
                          />
                        ) : (
                          <span className="text-lg">{option.icon}</span>
                        )}
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile optimized */}
          <div className="bg-white rounded-lg p-4 shadow-sm lg:h-fit">
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

              {appliedPromo?.code === "SAVE20" && (
                <p className="text-green-700 text-xs mt-1">
                  20% OFF on your order above Rs400 applied!
                </p>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-Rs {discount}</span>
                </div>
              )}

              {orderCount !== null && (orderCount < 3 || totalPrice > 200) ? (
                <p className="text-xs text-green-600 mt-1">
                  Free delivery{" "}
                  {orderCount < 3
                    ? `for your first ${3 - orderCount} order${
                        3 - orderCount > 1 ? "s" : ""
                      }`
                    : "because order total exceeds Rs200"}
                  !
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Rs {baseDeliveryFee} delivery fee applies.
                </p>
              )}
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-semibold text-base lg:text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={totalItems === 0}
              className={`w-full py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all ${
                totalItems === 0
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105"
              }`}
            >
              {totalItems === 0
                ? "Cart is empty"
                : needsProfileCompletion
                ? "Complete Profile & Place Order"
                : selectedPayment === "cod"
                ? "Place Order"
                : `Pay with ${
                    paymentOptions.find((p) => p.id === selectedPayment)?.label
                  }`}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        defaultAddress={deliveryAddress}
        onClose={async (updated) => {
          setShowProfileModal(false);
          if (updated) {
            await updateProfile();
          }
        }}
      />
    </div>
  );
};

export default Checkout;
