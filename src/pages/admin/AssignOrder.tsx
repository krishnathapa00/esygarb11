
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Package, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './components/AdminLayout';

const AssignOrder = () => {
  const { orderId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch order data from Supabase
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, total_amount, status, delivery_address, created_at,
          profiles!orders_user_id_fkey (full_name, phone_number),
          order_items (quantity, price, products!order_items_product_id_fkey (name))
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.order_number,
        customer: data.profiles?.full_name || 'Unknown Customer',
        phone: data.profiles?.phone_number || 'N/A',
        date: new Date(data.created_at).toLocaleDateString(),
        amount: Number(data.total_amount),
        status: data.status?.charAt(0).toUpperCase() + data.status?.slice(1),
        items: data.order_items?.map(item => ({
          id: Math.random(),
          name: item.products?.name || 'Unknown Product',
          quantity: item.quantity,
          price: Number(item.price)
        })) || [],
        address: data.delivery_address
      };
    },
    enabled: !!orderId
  });
  
  // Fetch delivery partners from Supabase
  const { data: deliveryPersons = [] } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, avatar_url')
        .eq('role', 'delivery_partner');
      
      if (error) throw error;
      
      return data?.map(person => ({
        id: person.id,
        name: person.full_name || 'Unknown Partner',
        phone: person.phone_number || 'N/A',
        status: 'Available',
        activeOrders: 0,
        rating: 4.8,
        distance: "1.2 km",
        image: person.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop'
      })) || [];
    }
  });

  const filteredDeliveryPersons = deliveryPersons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone.includes(searchTerm)
  );
  
  const handleAssign = async () => {
    if (!selectedDeliveryPerson || !orderId) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        delivery_partner_id: selectedDeliveryPerson,
        status: 'dispatched'
      })
      .eq('id', orderId);
    
    if (error) {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      const partner = deliveryPersons.find(p => p.id === selectedDeliveryPerson);
      toast({
        title: "Order assigned successfully",
        description: `Order has been assigned to ${partner?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      navigate('/admin/orders');
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
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span>{order.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {order?.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">₹{order?.amount}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Items ({order?.items?.length || 0})</h4>
                <div className="space-y-2">
                  {order?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
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
                  <span>{order?.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span>{order?.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Delivery Address</h3>
              </div>
              
              <p className="text-gray-600">{order?.address}</p>
              
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
                {(searchTerm ? filteredDeliveryPersons : deliveryPersons).map((person) => (
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
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={person.image}
                          alt={person.name}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{person.name}</h4>
                            <p className="text-sm text-gray-500">{person.phone}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-yellow-500">
                              <span className="mr-1">{person.rating}</span>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                              {person.activeOrders} active orders
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {person.distance} away
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
