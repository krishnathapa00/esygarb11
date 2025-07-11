
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderHistory = () => {
  // Mock orders data
  const orders = [
    {
      id: "ORD1234567",
      date: "June 6, 2025",
      total: 160,
      items: 3,
      status: "Delivered",
      statusColor: "text-green-600",
    },
    {
      id: "ORD1234566",
      date: "June 5, 2025",
      total: 210,
      items: 4,
      status: "Delivered",
      statusColor: "text-green-600",
    },
    {
      id: "ORD1234565",
      date: "June 3, 2025",
      total: 180,
      items: 2,
      status: "Cancelled",
      statusColor: "text-red-600",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-600">You have no orders yet.</p>
              <Link to="/">
                <Button className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.date} • {order.items} items
                      </p>
                      <p className="font-medium mt-1">₹{order.total}</p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      <p className={`font-medium ${order.statusColor} sm:text-right mb-2`}>
                        {order.status}
                      </p>
                      <div className="sm:text-right">
                        <Link to={`/order-tracking/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Order
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
