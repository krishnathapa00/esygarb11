
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderTracking = () => {
  const { orderId } = useParams();
  
  // Mock order data
  const orderStatus = {
    status: "Dispatched",
    steps: [
      { id: 1, title: "Order Placed", completed: true, time: "10:30 AM" },
      { id: 2, title: "Order Confirmed", completed: true, time: "10:32 AM" },
      { id: 3, title: "Order Dispatched", completed: true, time: "10:45 AM" },
      { id: 4, title: "Out for Delivery", completed: false, time: "" },
      { id: 5, title: "Delivered", completed: false, time: "" },
    ],
    estimatedDelivery: "10-15 mins"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/order-history">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Order #{orderId}</h2>
              <p className="text-sm text-gray-500">Estimated delivery: {orderStatus.estimatedDelivery}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              {orderStatus.status}
            </div>
          </div>
          
          <div className="space-y-6">
            {orderStatus.steps.map((step, index) => (
              <div key={step.id} className="relative flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.completed ? 'bg-green-600' : 'bg-gray-200'
                } text-white`}>
                  {step.completed ? (index + 1) : (index + 1)}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </h3>
                  {step.completed && (
                    <p className="text-sm text-gray-500">{step.time}</p>
                  )}
                </div>
                
                {index < orderStatus.steps.length - 1 && (
                  <div className={`absolute top-8 left-4 w-0.5 h-10 ${
                    step.completed && orderStatus.steps[index + 1].completed 
                      ? 'bg-green-600' 
                      : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
