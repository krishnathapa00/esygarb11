
import React, { useState } from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
=======
>>>>>>> 398f62f (code pushed by undead)
import AdminLayout from './components/AdminLayout';

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
<<<<<<< HEAD
  // Fetch real users from Supabase
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, phone_number, created_at,
          orders:orders(count)
        `)
        .eq('role', 'customer');
      
      if (error) throw error;
      
      return data?.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown User',
        phone: user.phone_number || 'N/A',
        email: 'N/A', // Email not available in profiles
        orders: user.orders?.[0]?.count || 0,
        status: 'Active', // Default status
        joinedOn: new Date(user.created_at).toLocaleDateString(),
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop'
      })) || [];
    }
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );
=======
  // Mock user data
  const users = [
    { id: 1, name: 'John Doe', phone: '+91 98765 43210', email: 'john@example.com', orders: 12, status: 'Active', joinedOn: 'May 10, 2025', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop' },
    { id: 2, name: 'Jane Smith', phone: '+91 87654 32109', email: 'jane@example.com', orders: 8, status: 'Active', joinedOn: 'May 15, 2025', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=48&h=48&fit=crop' },
    { id: 3, name: 'Robert Johnson', phone: '+91 76543 21098', email: 'robert@example.com', orders: 5, status: 'Inactive', joinedOn: 'May 20, 2025', image: 'https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?w=48&h=48&fit=crop' },
    { id: 4, name: 'Emily Wilson', phone: '+91 65432 10987', email: 'emily@example.com', orders: 15, status: 'Active', joinedOn: 'May 22, 2025', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=48&h=48&fit=crop' },
    { id: 5, name: 'Michael Brown', phone: '+91 54321 09876', email: 'michael@example.com', orders: 3, status: 'Blocked', joinedOn: 'May 25, 2025', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop' },
  ];
>>>>>>> 398f62f (code pushed by undead)
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined On
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
<<<<<<< HEAD
                {(searchTerm ? filteredUsers : users).map((user) => (
=======
                {users.map((user) => (
>>>>>>> 398f62f (code pushed by undead)
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.orders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.joinedOn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
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

export default ManageUsers;
