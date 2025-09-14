import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/components/Toast";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackOrder = JSON.parse(
    sessionStorage.getItem("last_order") || "{}"
  );
  const orderData = location.state || fallbackOrder;

  const [canCancel, setCanCancel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (isCancelled) return;

    if (!orderData) {
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      if (!orderData.createdAt) {
        setCanCancel(false);
        setTimeLeft(0);
        return;
      }

      const orderTime = new Date(orderData.createdAt).getTime();
      const now = Date.now();
      const remainingMs = 2 * 60 * 1000 - (now - orderTime);
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

      setTimeLeft(remainingSec);
      setCanCancel(remainingSec > 0);
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, [orderData, navigate, isCancelled]);

  const handleCancelOrder = async () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("order_number", orderData.orderId);

        if (error) throw error;

        showToast("Your order has been cancelled successfully.", "success");

        setIsCancelled(true);
      } catch (error) {
        console.error("Error cancelling order:", error);
        showToast("Failed to cancel order. Please try again.", "error");
      }
    }
  };

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Order Confirmation
          </h1>
        </div>

        {isCancelled ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Cancelled
            </h2>
            <p className="text-gray-600 mb-6">
              Your order has been cancelled successfully. We're sorry to see you
              go!
            </p>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've received your request and will
              deliver it shortly.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-700 font-medium">
                Order ID: {orderData.orderId}
              </p>
              <p className="text-green-700">
                Estimated delivery in {orderData.estimatedDelivery}
              </p>
            </div>

            <div className="space-y-6 text-left">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Order Summary:</h3>
                {orderData.items && Array.isArray(orderData.items) ? (
                  <div className="space-y-2">
                    {orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>Rs {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Items: {orderData.totalItems || 0}
                  </p>
                )}
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>Rs {orderData.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-gray-600">{orderData.deliveryAddress}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p className="text-gray-600">{orderData.paymentMethod}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {/* Cancellation Notice */}
              {!isCancelled && canCancel && (
                <div className="mb-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
                  <span>
                    ⚠️ Cancellation allowed for {Math.floor(timeLeft / 60)}:
                    {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}{" "}
                    more seconds.
                  </span>
                  <Button
                    variant="destructive"
                    className="ml-4"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
                <Link
                  to={`/order-tracking/${orderData.orderId}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Track Order
                  </Button>
                </Link>
                <Link to="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
