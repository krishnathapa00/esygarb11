
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  // Mock order data
  const orderData = {
    orderId: "ORD1234567",
    items: 3,
    totalAmount: 160,
    deliveryAddress: "123 Main St, Apartment 4B, New York, NY 10001",
    estimatedDelivery: "10-15 mins"
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. We've received your request and will deliver it shortly.</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-700 font-medium">Order ID: {orderData.orderId}</p>
            <p className="text-green-700">Estimated delivery in {orderData.estimatedDelivery}</p>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <p className="text-gray-600">Items: {orderData.items}</p>
              <p className="text-gray-600">Total: Rs{orderData.totalAmount}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p className="text-gray-600">{orderData.deliveryAddress}</p>
            </div>
          </div>
          
          <div className="mt-8 space-x-4">
            <Link to="/order-tracking/ORD1234567">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Track Order
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">
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
