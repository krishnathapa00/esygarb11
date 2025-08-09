import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Loader2,
  Banknote,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import EsewaLogo from "../assets/payments/esewa.jpg";
import KhaltiLogo from "../assets/payments/khalti.jpg";

const Checkout = () => {
  const { cart, resetCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
  });

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Calculate total from cart
  const cartItems = cart || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Fetch delivery fee from admin settings
  const [deliveryFee, setDeliveryFee] = useState(50); // Default fallback
  
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_config')
          .select('delivery_fee')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data && !error) {
          setDeliveryFee(parseFloat(data.delivery_fee.toString()));
        }
      } catch (error) {
        console.error('Error fetching delivery fee:', error);
      }
    };
    
    fetchDeliveryFee();
  }, []);
  
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

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const deliveryAddress = "Default delivery address";
      
      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          order_number: `ORD${Date.now()}`,
          payment_status: selectedPayment === 'cod' ? 'pending' : 'completed',
          status: 'confirmed'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Store order ID for confirmation page
      localStorage.setItem('latest_order_id', orderData.id);
      
      resetCart();
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed and will be processed soon.",
      });
      
      navigate('/order-confirmation');
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (authLoading) {
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

        {/* Mobile-first layout */}
        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            

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
                <span>Subtotal ({cartItems.length} items)</span>
                <span>Rs {subtotal}</span>
              </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "FREE" : `Rs ${deliveryFee}`}
                  </span>
                </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-semibold text-base lg:text-lg">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading || cartItems.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-base font-semibold"
            >
              {loading ? "Processing..." : (
                selectedPayment === "cod"
                  ? "Place Order"
                  : `Pay with ${
                      paymentOptions.find((p) => p.id === selectedPayment)?.label
                    }`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
