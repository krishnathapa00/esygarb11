import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const Checkout = () => {
  const { cart, resetCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
  });

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Calculate totals from cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 200 ? 0 : 20;
  const totalAmount = subtotal + deliveryFee;

  useEffect(() => {
    // Auto-fill from profile data (simulated - in real app this would come from database/context)
    const profileData = {
      fullName: "John Doe",
      phone: "+977 9876543210",
    };

    setFormData((prev) => ({
      ...prev,
      fullName: profileData.fullName,
      phone: profileData.phone,
    }));

    // Auto-fill location from previous detection
    const savedLocation = localStorage.getItem("esygrab_user_location");
    if (savedLocation && savedLocation !== "Current Location Detected" && savedLocation !== "null" && savedLocation !== "undefined") {
      try {
        const savedLocationData = JSON.parse(savedLocation);
        if (savedLocationData && savedLocationData.address) {
          setFormData((prev) => ({
            ...prev,
            address: savedLocationData.address,
            city: savedLocationData.city || "Kathmandu", // Default city if not provided
            state: savedLocationData.state || "Bagmati", // Default state if not provided
            pincode: savedLocationData.pincode || "44600", // Default pincode if not provided
          }));
        }
      } catch (error) {
        console.error("Error parsing saved location:", error);
      }
    }
  }, []);

  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simulate a successful geocoding response
            const locationData = {
              address: "Thamel, Kathmandu",
              city: "Kathmandu",
              state: "Bagmati",
              pincode: "44600",
              formatted: "Thamel, Kathmandu, Bagmati 44600",
            };

            setFormData((prev) => ({
              ...prev,
              address: locationData.address,
              city: locationData.city,
              state: locationData.state,
              pincode: locationData.pincode,
            }));

            // Save to localStorage
            localStorage.setItem(
              "esygrab_user_location",
              JSON.stringify(locationData)
            );
          } catch (error) {
            console.log("Using fallback location");
            const fallbackData = {
              address: "Current location detected",
              city: "Kathmandu",
              state: "Bagmati",
              pincode: "",
            };
            setFormData((prev) => ({ ...prev, ...fallbackData }));
          }
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
      console.log("Geolocation not supported");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    try {
      if (!user?.id) {
        alert("Please log in to place an order.");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      // More flexible address validation - check if we have at least an address
      if (!formData.address || formData.address.trim() === "") {
        alert("Please provide delivery address details.");
        return;
      }

      // Create order in database
      const orderData = {
        order_number: `ORD${Date.now()}`,
        user_id: user.id,
        total_amount: totalAmount,
        delivery_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`.trim(),
        estimated_delivery: "10-15 mins",
        status: "pending" as const,
        payment_status: (selectedPayment === "cod" ? "pending" : "completed") as "pending" | "completed"
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw itemsError;
      }

      // Save order ID to localStorage for order confirmation page
      localStorage.setItem('latest_order_id', order.id);
      
      resetCart();
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const paymentOptions = [
    { id: "cod", label: "Cash on Delivery (COD)", icon: "💵" },
    { id: "khalti", label: "Khalti", icon: "📱" },
    { id: "esewa", label: "eSewa", icon: "💳" },
    { id: "bank", label: "Bank Transfer", icon: "🏦" },
  ];

  if (loading) {
    // Show loading while checking auth
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
      <Header />

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

        {/* Responsive layout with proper spacing */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 pb-20 md:pb-0">
          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                Payment Method
              </h3>
            </div>

            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all w-full ${
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
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Mobile optimized */}
          <div className="bg-white rounded-lg p-4 shadow-sm lg:h-fit">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                  Rs {deliveryFee}
                </span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-xs text-green-600">Free delivery on orders above Rs.200</p>
              )}
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-semibold text-base lg:text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Place Order button only visible on desktop */}
            <Button
              onClick={handlePlaceOrder}
              className="hidden md:flex w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-base font-medium"
            >
              {selectedPayment === "cod"
                ? "Place Order"
                : `Pay with ${
                    paymentOptions.find((p) => p.id === selectedPayment)?.label
                  }`}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Place Order Button - Only visible on mobile for checkout page */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
        <Button
          onClick={handlePlaceOrder}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-base font-medium"
        >
          {selectedPayment === "cod"
            ? "Place Order"
            : `Pay with ${
                paymentOptions.find((p) => p.id === selectedPayment)?.label
              }`}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
