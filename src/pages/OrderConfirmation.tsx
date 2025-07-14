
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      const orderId = localStorage.getItem('latest_order_id');
      if (orderId) {
        const { data: order } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (name, image_url)
            )
          `)
          .eq('id', orderId)
          .single();

        if (order) {
          setOrderData(order);
          setOrderItems(order.order_items || []);
        }
        localStorage.removeItem('latest_order_id');
      }
    };

    fetchOrderData();
  }, []);

  // Fallback to mock data if no order found
  const displayData = orderData || {
    order_number: "ORD1234567",
    total_amount: 160,
    delivery_address: "Kathmandu, Nepal",
    estimated_delivery: "10-15 mins"
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0) || 3;
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 140;
  const deliveryFee = subtotal > 200 ? 0 : 20;
  const finalTotal = subtotal + deliveryFee;

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
            <p className="text-green-700 font-medium">Order ID: {displayData.order_number}</p>
            <p className="text-green-700">Estimated delivery in {displayData.estimated_delivery}</p>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
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
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>Rs {finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p className="text-gray-600">{displayData.delivery_address}</p>
            </div>

            {orderItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Items Ordered</h3>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{item.products?.name || 'Product'} x {item.quantity}</span>
                      <span>Rs {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 space-x-4">
            <Link to={`/order-tracking/${displayData.order_number}`}>
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
