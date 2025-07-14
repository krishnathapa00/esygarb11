import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
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
    if (savedLocation && savedLocation !== "Current Location Detected") {
      const savedLocationData = JSON.parse(savedLocation || "{}");
      if (savedLocationData.address) {
        setFormData((prev) => ({
          ...prev,
          address: savedLocationData.address,
          city: savedLocationData.city || "",
          state: savedLocationData.state || "",
          pincode: savedLocationData.pincode || "",
        }));
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

  const handlePlaceOrder = () => {
    if (selectedPayment === "cod") {
      resetCart();
      // Direct to order confirmation for COD
      window.location.href = "/order-confirmation";
    } else {
      // For now, simulate payment success for other methods
      // In production, integrate with actual payment gateways
      console.log(`Processing ${selectedPayment} payment...`);
      setTimeout(() => {
        resetCart();
        window.location.href = "/order-confirmation";
      }, 2000);
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

        {/* Simplified layout */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                Payment Method
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {paymentOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all flex-1 min-w-[140px] ${
                    selectedPayment === option.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPayment(option.id)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.id}
                      name="payment"
                      value={option.id}
                      checked={selectedPayment === option.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-green-600 w-4 h-4"
                    />
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-xs font-medium">
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

            <Button
              onClick={handlePlaceOrder}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-base font-medium fixed bottom-20 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto z-50"
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
    </div>
  );
};

export default Checkout;
