
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

const AssignDelivery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch delivery partners from Supabase
  const { data: deliveryPersons = [] } = useQuery({
    queryKey: ['assign-delivery-partners'],
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

  // Filter delivery partners based on search
  const filteredDeliveryPersons = deliveryPersons.filter(person => 
    person.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-amber-100 text-amber-800';
      case 'Offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-xl md:text-2xl font-bold">Assign Delivery</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 md:pl-10 text-sm"
            />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Person
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Contact
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Orders
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Rating
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveryPersons.map((person) => (
                  <tr key={person.id}>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs md:text-sm">
                              {person.full_name?.charAt(0).toUpperCase() || 'D'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <div className="text-xs md:text-sm font-medium text-gray-900">{person.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{person.phone_number || person.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-500">ID: {person.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-xs md:text-sm text-gray-900">{person.phone_number || person.phone || 'N/A'}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Available
                      </Badge>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs md:text-sm text-gray-900">{person.assigned_orders?.[0]?.count || 0} active</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm text-gray-900 mr-1">4.5</span>
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Assign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignDelivery;
