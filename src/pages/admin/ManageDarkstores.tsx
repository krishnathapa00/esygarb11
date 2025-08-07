
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const ManageDarkstores = () => {
  const [newDarkstore, setNewDarkstore] = useState({
    name: '',
    address: '',
    city: '',
    state: 'California',
    zip_code: '',
    phone_number: '',
    manager_name: ''
  });
  const [editingDarkstore, setEditingDarkstore] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: darkstores = [], isLoading } = useQuery({
    queryKey: ['darkstores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkstores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createDarkstoreMutation = useMutation({
    mutationFn: async (darkstore: any) => {
      const { error } = await supabase
        .from('darkstores')
        .insert([darkstore]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darkstores'] });
      setDialogOpen(false);
      setNewDarkstore({
        name: '',
        address: '',
        city: '',
        state: 'California',
        zip_code: '',
        phone_number: '',
        manager_name: ''
      });
      toast({
        title: "Success",
        description: "Darkstore created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create darkstore.",
        variant: "destructive",
      });
    }
  });

  const updateDarkstoreMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('darkstores')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darkstores'] });
      setEditingDarkstore(null);
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Darkstore updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update darkstore.",
        variant: "destructive",
      });
    }
  });

  const deleteDarkstoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('darkstores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darkstores'] });
      toast({
        title: "Success",
        description: "Darkstore deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete darkstore.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDarkstore) {
      updateDarkstoreMutation.mutate({ ...editingDarkstore });
    } else {
      createDarkstoreMutation.mutate(newDarkstore);
    }
  };

  const openEditDialog = (darkstore: any) => {
    setEditingDarkstore(darkstore);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingDarkstore(null);
    setDialogOpen(true);
  };

  const currentDarkstore = editingDarkstore || newDarkstore;
  const setCurrentDarkstore = (darkstore: any) => {
    if (editingDarkstore) {
      setEditingDarkstore(darkstore);
    } else {
      setNewDarkstore(darkstore);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Darkstores</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Darkstore
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDarkstore ? 'Edit Darkstore' : 'Create New Darkstore'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Darkstore Name"
                  value={currentDarkstore.name}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Address"
                  value={currentDarkstore.address}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, address: e.target.value })}
                  required
                />
                <Input
                  placeholder="City"
                  value={currentDarkstore.city}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, city: e.target.value })}
                  required
                />
                <Input
                  placeholder="ZIP Code"
                  value={currentDarkstore.zip_code}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, zip_code: e.target.value })}
                  required
                />
                <Input
                  placeholder="Phone Number"
                  value={currentDarkstore.phone_number}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, phone_number: e.target.value })}
                />
                <Input
                  placeholder="Manager Name"
                  value={currentDarkstore.manager_name}
                  onChange={(e) => setCurrentDarkstore({ ...currentDarkstore, manager_name: e.target.value })}
                />
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createDarkstoreMutation.isPending || updateDarkstoreMutation.isPending}>
                    {editingDarkstore ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div>Loading darkstores...</div>
          ) : (
            darkstores.map((darkstore) => (
              <Card key={darkstore.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{darkstore.name}</h3>
                    <p className="text-sm text-muted-foreground">{darkstore.address}</p>
                    <p className="text-sm text-muted-foreground">{darkstore.city}, {darkstore.state} {darkstore.zip_code}</p>
                    {darkstore.phone_number && (
                      <p className="text-sm text-muted-foreground">Phone: {darkstore.phone_number}</p>
                    )}
                    {darkstore.manager_name && (
                      <p className="text-sm text-muted-foreground">Manager: {darkstore.manager_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Status: {darkstore.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(darkstore)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteDarkstoreMutation.mutate(darkstore.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageDarkstores;
