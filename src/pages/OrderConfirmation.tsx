import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackOrder = JSON.parse(
    sessionStorage.getItem("last_order") || "{}"
  );
  const orderData = location.state || fallbackOrder;

  useEffect(() => {
    if (!orderData) {
      // Redirect back if no data (e.g., user opened page directly)
      navigate("/");
    }
  }, [orderData, navigate]);

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
              <h3 className="font-semibold mb-2">Order Summary</h3>
              {orderData.items && Array.isArray(orderData.items) ? (
                <div className="space-y-2">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>Rs {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Items: {orderData.totalItems || 0}</p>
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

          <div className="mt-8 space-x-4">
            <Link to={`/order-tracking/${orderData.orderId}`}>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Track Order
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
