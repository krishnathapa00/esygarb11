import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin } from 'lucide-react';

interface Darkstore {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

const DarkstoreSelector = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available darkstores
  const { data: darkstores = [], isLoading } = useQuery({
    queryKey: ['available-darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_darkstores');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch current profile
  const { data: profile } = useQuery({
    queryKey: ['delivery-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('darkstore_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Update darkstore assignment
  const updateDarkstore = useMutation({
    mutationFn: async (darkstoreId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          darkstore_id: darkstoreId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      toast({
        title: "Darkstore Updated",
        description: "Your assigned darkstore has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update darkstore assignment",
        variant: "destructive"
      });
    }
  });

  const handleDarkstoreChange = (darkstoreId: string) => {
    updateDarkstore.mutate(darkstoreId);
  };

  const getCurrentDarkstore = () => {
    if (!profile?.darkstore_id) return null;
    return darkstores.find(d => d.id === parseInt(profile.darkstore_id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDarkstore = getCurrentDarkstore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Select Your Darkstore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select
            value={profile?.darkstore_id || ''}
            onValueChange={handleDarkstoreChange}
            disabled={updateDarkstore.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a darkstore to work from" />
            </SelectTrigger>
            <SelectContent>
              {darkstores.map((darkstore) => (
                <SelectItem key={darkstore.id} value={darkstore.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{darkstore.name}</span>
                    <span className="text-sm text-gray-500">
                      {darkstore.city}, {darkstore.state}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentDarkstore && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800">
                  Currently Assigned: {currentDarkstore.name}
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  {currentDarkstore.address}, {currentDarkstore.city}, {currentDarkstore.state} {currentDarkstore.zip_code}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            💡 <strong>Tip:</strong> You'll only receive orders from your selected darkstore. 
            Choose the one closest to your preferred delivery area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DarkstoreSelector;