
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, CheckCircle, Clock, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const OrderTracking = () => {
  const { id: orderId } = useParams();
  
  // Fetch real order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_status_history(status, timestamp, notes),
          profiles!orders_delivery_partner_id_fkey(full_name, phone_number)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000 // Refetch every 10 seconds for real-time updates
  });

  const getOrderSteps = () => {
    if (!order) return [];
    
    const allSteps = [
      { id: 1, title: "Order Placed", status: "pending", time: "", icon: CheckCircle },
      { id: 2, title: "Order Confirmed", status: "confirmed", time: "", icon: CheckCircle },
      { id: 3, title: "Ready for Pickup", status: "ready_for_pickup", time: "", icon: Clock },
      { id: 4, title: "Order Dispatched", status: "dispatched", time: "", icon: Truck },
      { id: 5, title: "Out for Delivery", status: "out_for_delivery", time: "", icon: Truck },
      { id: 6, title: "Delivered", status: "delivered", time: "", icon: MapPin },
    ];

    // Get status history for timestamps
    const statusHistory = order.order_status_history || [];
    const statusMap = new Map();
    statusHistory.forEach(history => {
      statusMap.set(history.status, new Date(history.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    });

    // Mark steps as completed based on current status
    const currentStatusIndex = allSteps.findIndex(step => step.status === order.status);
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      time: statusMap.get(step.status) || (index === 0 ? new Date(order.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : "")
    }));
  };

  const getStatusMessage = () => {
    if (!order) return "";
    
    switch (order.status) {
      case 'pending':
        return "Your order has been placed and is being processed.";
      case 'confirmed':
        return "Your order has been confirmed and is being prepared.";
      case 'ready_for_pickup':
        return "Your order is ready and waiting for pickup by our delivery partner.";
      case 'dispatched':
        return `Your order has been picked up by ${order.profiles?.full_name || 'our delivery partner'} and is on the way!`;
      case 'out_for_delivery':
        return "Your order is reaching your location! The delivery partner is nearby.";
      case 'delivered':
        return "Your order has been successfully delivered. Thank you for choosing EsyGrab!";
      default:
        return "Tracking your order...";
    }
  };

  const orderSteps = getOrderSteps();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Order #{order?.order_number}</h2>
              <p className="text-sm text-gray-500">Estimated delivery: {order?.estimated_delivery || '10-15 mins'}</p>
              {order?.profiles && (
                <p className="text-sm text-gray-600 mt-1">
                  Delivery Partner: {order.profiles.full_name} ({order.profiles.phone_number})
                </p>
              )}
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              {order?.status?.replace('_', ' ') || 'Processing'}
            </div>
          </div>
          
          {/* Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">{getStatusMessage()}</p>
          </div>
          
          <div className="space-y-6">
            {orderSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="relative flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                  } shadow-lg`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className={`font-semibold ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </h3>
                    {step.completed && step.time && (
                      <p className="text-sm text-gray-500">{step.time}</p>
                    )}
                    {step.completed && !step.time && index === 0 && (
                      <p className="text-sm text-gray-500">Just now</p>
                    )}
                  </div>
                  
                  {index < orderSteps.length - 1 && (
                    <div className={`absolute top-10 left-5 w-0.5 h-8 ${
                      step.completed && orderSteps[index + 1].completed 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
