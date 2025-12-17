import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  WalletIcon,
  MapPin,
  Banknote,
} from "lucide-react";

import { Header } from "@/components/shared";
import ProfileCompletionModal from "@/components/user/ProfileCompletionModal";
import { Button } from "@/components/ui/button";

import KhaltiLogo from "@/assets/payments/khalti.jpg";
import EsewaLogo from "@/assets/payments/esewa.jpg";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserProfile } from "@/hooks/useUserProfile";

import { supabase } from "@/integrations/supabase/client";
import { DELIVERY_AREA_COORDS } from "@/data/deliveryConsts";
import { LocationDisplay } from "@/components/delivery";

// Utility Functions

// Reliable point-in-polygon
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

function parseJsonSafe(value) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

// Main Page Component

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading } = useAuth();
  const { cart, resetCart, mergeGuestCart } = useCart();
  const { profile, updateProfile } = useUserProfile();

  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isWithinRange, setIsWithinRange] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [orderCount, setOrderCount] = useState(null);

  const [showProfileModal, setShowProfileModal] = useState(true);

  // ---- Promo state restored from session ----
  const [promoDiscount, setPromoDiscount] = useState(() => {
    const fromState = location.state?.promoDiscount;
    if (fromState) return fromState;

    const stored = sessionStorage.getItem("promo_discount");
    return stored ? Number(stored) : 0;
  });

  const [appliedPromo, setAppliedPromo] = useState(() => {
    const fromState = location.state?.appliedPromo;
    if (fromState) return fromState;

    const stored = sessionStorage.getItem("applied_promo");
    return stored ? JSON.parse(stored) : null;
  });

  // Delivery Config Query

  const { data: deliveryConfig } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("delivery_config error:", error);
        return { delivery_fee: 15 };
      }

      return data ?? { delivery_fee: 15 };
    },
  });

  const baseDeliveryFee = deliveryConfig?.delivery_fee ?? 10;

  // Derived Values (Memoized)

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee =
    orderCount === 0 || totalPrice > 200 ? 0 : baseDeliveryFee;
  const totalAmount = totalPrice + deliveryFee - promoDiscount;

  const needsProfileCompletion =
    user && (!profile.full_name || !profile.phone) && !deliveryAddress;

  // Persist promo in session

  useEffect(() => {
    if (appliedPromo)
      sessionStorage.setItem("applied_promo", JSON.stringify(appliedPromo));
  }, [appliedPromo]);

  useEffect(() => {
    sessionStorage.setItem("promo_discount", promoDiscount);
  }, [promoDiscount]);

  // Load user location

  useEffect(() => {
    if (!user) return;

    const loadLocation = async () => {
      // Latest map selection (localStorage override)
      const stored = parseJsonSafe(
        localStorage.getItem("esygrab_user_location")
      );

      if (stored?.address && stored?.coordinates) {
        setDeliveryAddress(stored.address);
        setDeliveryCoords(stored.coordinates);
        return;
      }

      // Load from profile (old user)
      const { data, error } = await supabase
        .from("profiles")
        .select("delivery_location, location")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      // Delivery Address (TEXT)
      if (data?.delivery_location) {
        setDeliveryAddress(data.delivery_location);
      }

      // Coordinates (JSONB)
      const coords = parseJsonSafe(data?.location);
      if (coords?.lat && coords?.lng) {
        setDeliveryCoords(coords);
        return;
      }

      // First-time user → force map
      navigate("/map-location");
    };

    loadLocation();
  }, [user, navigate]);

  // Validate delivery range

  useEffect(() => {
    if (!deliveryCoords) {
      setIsWithinRange(false);
      return;
    }

    const inside = pointInPolygon(
      deliveryCoords.lat,
      deliveryCoords.lng,
      DELIVERY_AREA_COORDS
    );

    setIsWithinRange(inside);
  }, [deliveryCoords]);

  // Fetch previous order count

  useEffect(() => {
    if (!user) return;

    supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .then(({ count }) => setOrderCount(count ?? 0));
  }, [user]);

  // Auth + guest cart restore

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      localStorage.setItem("auth_redirect_url", "/checkout");
      navigate("/auth");
      return;
    }

    if (user && cart.length === 0) {
      const guest = localStorage.getItem("guest_cart");
      if (guest) {
        mergeGuestCart(JSON.parse(guest));
        localStorage.removeItem("guest_cart");
      }
    }
  }, [loading, user, cart]);

  // Place Order

  const handlePlaceOrder = async () => {
    if (!user) return alert("Please log in.");
    if (needsProfileCompletion) return setShowProfileModal(true);
    if (!deliveryCoords || !deliveryAddress)
      return alert("Please set your delivery address.");
    if (!isWithinRange)
      return alert("Your location is outside our delivery area.");

    try {
      const orderNumber = `ORD${Date.now()}`;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          estimated_delivery: "10 mins",
          promo_code_id: appliedPromo?.id ?? null,
          promo_discount: promoDiscount,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert promo usage
      if (order && appliedPromo) {
        await supabase.from("promo_code_usage").insert({
          user_id: user.id,
          promo_code_id: appliedPromo.id,
          order_id: order.id,
          discount_amount: promoDiscount,
        });
      }

      // Insert items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from("order_items").insert(items);

      resetCart();

      const orderDetails = {
        orderId: orderNumber,
        items: cart,
        totalItems,
        totalAmount,
        deliveryAddress,
        deliveryFee,
        discount: promoDiscount,
        paymentMethod:
          paymentOptions.find((p) => p.id === selectedPayment)?.label || "",
        estimatedDelivery: "10 mins",
      };

      sessionStorage.setItem("last_order", JSON.stringify(orderDetails));
      sessionStorage.removeItem("applied_promo");
      sessionStorage.removeItem("promo_discount");

      navigate("/order-confirmation", { state: orderDetails });
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  // Payment Options

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

  // UI Rendering

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block">
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
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Address
              </h3>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4 flex gap-2">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Delivering to:
                  </p>
                  <LocationDisplay
                    address={deliveryAddress}
                    fallback="Please set delivery address"
                    className="text-sm text-green-700"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/map-location")}
              >
                Change Delivery Address
              </Button>

              {!isWithinRange && (
                <p className="text-red-600 text-sm mt-2">
                  Your location is outside our delivery area.
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-4 w-4 text-green-600" />
                <h3 className="text-base lg:text-lg font-semibold">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPayment(p.id)}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPayment === p.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === p.id}
                        className="w-4 h-4 text-green-600"
                        onChange={() => setSelectedPayment(p.id)}
                      />
                      <div className="flex items-center gap-2">
                        {typeof p.icon === "string" ? (
                          <img src={p.icon} alt={p.label} className="h-6 w-6" />
                        ) : (
                          p.icon
                        )}
                        <span className="text-sm font-medium">{p.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md text-sm">
                <strong>Note:</strong> Currently only{" "}
                <strong>Cash on Delivery (COD)</strong> is available.
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>Rs {totalPrice}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs {deliveryFee}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-Rs {promoDiscount}</span>
                </div>
              )}

              {/* Free Delivery Messages */}
              {orderCount !== null &&
                (orderCount === 0 || totalPrice > 200) && (
                  <p className="text-xs text-green-600 mt-1">
                    {orderCount === 0
                      ? "Enjoy free delivery on your first order!"
                      : "Free delivery — order exceeds Rs200!"}
                  </p>
                )}

              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={totalItems === 0 || !isWithinRange}
              className={`w-full py-4 text-lg font-semibold rounded-xl shadow-lg ${
                totalItems === 0 || !isWithinRange
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white"
              }`}
            >
              {totalItems === 0
                ? "Cart is empty"
                : !isWithinRange
                ? "Cannot deliver to your location"
                : selectedPayment === "cod"
                ? "Place Order"
                : `Pay with ${
                    paymentOptions.find((p) => p.id === selectedPayment)?.label
                  }`}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal && needsProfileCompletion}
        onClose={async (updated) => {
          setShowProfileModal(false);
          if (updated) updateProfile();
        }}
      />
    </div>
  );
};

export default Checkout;

