import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // if using supabase to update status

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackOrder = JSON.parse(
    sessionStorage.getItem("last_order") || "{}"
  );
  const orderData = location.state || fallbackOrder;

  const [canCancel, setCanCancel] = useState(false);

  useEffect(() => {
    if (!orderData) {
      navigate("/");
      return;
    }

    const checkCancel = () => {
      const orderTime = new Date(orderData.createdAt).getTime();
      const now = Date.now();
      const diffMs = now - orderTime;
      setCanCancel(diffMs <= 2 * 60 * 1000); // 2 minutes
    };

    checkCancel();
    const interval = setInterval(checkCancel, 1000);

    return () => clearInterval(interval);
  }, [orderData, navigate]);

  const handleCancelOrder = async () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("order_number", orderData.orderId);

        if (error) throw error;

        alert("Order cancelled successfully.");
        setCanCancel(false);
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order. Please try again.");
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
            {canCancel && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-center text-sm">
                ⚠️ Cancellation is allowed within 1-2 minutes of placing the
                order.
              </div>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            )}

            <Link to={`/order-tracking/${orderData.orderId}`}>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 w-full sm:w-auto">
                Track Order
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
