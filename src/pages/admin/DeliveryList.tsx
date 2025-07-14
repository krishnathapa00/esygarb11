import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle, XCircle, Clock, User, Phone, MapPin } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const DeliveryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch delivery partners
  const { data: deliveryPartners = [], isLoading } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders!orders_delivery_partner_id_fkey(id, status, created_at)
        `)
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching delivery partners",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    }
  });

  // Update partner status mutation
  const updatePartnerStatus = useMutation({
    mutationFn: async ({ partnerId, role }: { partnerId: string; role: 'delivery_partner' | 'customer' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      toast({
        title: "Status updated",
        description: "Delivery partner status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredPartners = deliveryPartners.filter(partner =>
    partner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (role: string) => {
    switch (role) {
      case 'delivery_partner':
        return 'bg-green-100 text-green-700';
      case 'customer':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStats = (orders: any[]) => {
    if (!orders) return { total: 0, completed: 0, pending: 0 };
    
    const total = orders.length;
    const completed = orders.filter(order => order.status === 'delivered').length;
    const pending = orders.filter(order => 
      ['confirmed', 'dispatched', 'out_for_delivery'].includes(order.status)
    ).length;
    
    return { total, completed, pending };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Delivery Partners</h1>
            <p className="text-gray-500">Manage delivery partner registrations and status</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Partner Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading delivery partners...</p>
              </div>
            ) : filteredPartners.length > 0 ? (
              <div className="space-y-4">
                {filteredPartners.map((partner) => {
                  const orderStats = getOrderStats(partner.orders);
                  return (
                    <div key={partner.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-600" />
                            <h3 className="font-semibold text-lg">{partner.full_name || 'Unnamed Partner'}</h3>
                            <Badge className={getStatusColor(partner.role)}>
                              {partner.role === 'delivery_partner' ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{partner.phone_number || 'No phone'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{partner.location || 'No location'}</span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Vehicle:</span> {partner.vehicle_type || 'Not specified'}
                            </div>
                          </div>

                          {partner.license_number && (
                            <div className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">License:</span> {partner.license_number}
                            </div>
                          )}

                          <div className="flex space-x-6 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Total Orders:</span>
                              <span className="ml-2 font-semibold">{orderStats.total}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Completed:</span>
                              <span className="ml-2 font-semibold text-green-600">{orderStats.completed}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Pending:</span>
                              <span className="ml-2 font-semibold text-orange-600">{orderStats.pending}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {partner.role === 'customer' ? (
                            <Button
                              size="sm"
                              onClick={() => updatePartnerStatus.mutate({ 
                                partnerId: partner.id, 
                                role: 'delivery_partner' 
                              })}
                              disabled={updatePartnerStatus.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updatePartnerStatus.mutate({ 
                                partnerId: partner.id, 
                                role: 'customer' 
                              })}
                              disabled={updatePartnerStatus.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                          
                          <div className="text-xs text-gray-500 text-center">
                            Joined: {new Date(partner.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No delivery partners found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DeliveryList;