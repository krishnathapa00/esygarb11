
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Package, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

const AssignOrder = () => {
  const { orderId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch order data
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey ( full_name, phone_number ),
          order_items ( *, products:product_id ( name, price ) )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        toast({
          title: "Failed to load order",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      return data;
    }
  });

  // Fetch delivery partners
  const { data: deliveryPersons = [] } = useQuery({
    queryKey: ['available-delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          assigned_orders:orders!delivery_partner_id(count)
        `)
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Failed to load delivery partners",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      return data || [];
    }
  });
  
  const handleAssign = async () => {
    if (selectedDeliveryPerson && orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: selectedDeliveryPerson,
          status: 'dispatched'
        })
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Failed to assign order",
          description: error.message,
          variant: "destructive"
        });
      } else {
        const deliveryPerson = deliveryPersons.find(p => p.id === selectedDeliveryPerson);
        toast({
          title: "Order assigned successfully",
          description: `Order has been assigned to ${deliveryPerson?.full_name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      }
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Assign Order #{orderId}</h1>
            <p className="text-gray-500">Select a delivery person for this order</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Order Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{order?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span>{order ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {order?.status?.replace('_', ' ') || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">₹{order?.total_amount}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Items ({order?.order_items?.length || 0})</h4>
                <div className="space-y-2">
                  {order?.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.products?.name} x{item.quantity}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Customer Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span>{order?.profiles?.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span>{order?.profiles?.phone_number || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Delivery Address</h3>
              </div>
              
              <p className="text-gray-600">{order?.delivery_address || 'N/A'}</p>
              
              <div className="mt-4 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map location would appear here</span>
              </div>
            </div>
          </div>
          
          {/* Delivery Persons */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Select Delivery Person</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search delivery persons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-4 mt-6">
                {deliveryPersons.map((person) => (
                  <div 
                    key={person.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDeliveryPerson === person.id 
                        ? 'border-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDeliveryPerson(person.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {person.full_name?.charAt(0).toUpperCase() || 'D'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{person.full_name || 'N/A'}</h4>
                            <p className="text-sm text-gray-500">{person.phone_number || person.phone || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-yellow-500">
                              <span className="mr-1">4.5</span>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                              {person.assigned_orders?.[0]?.count || 0} active orders
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={!selectedDeliveryPerson}
                  onClick={handleAssign}
                >
                  Assign Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignOrder;
