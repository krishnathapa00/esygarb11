import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const DeliveryWithdraw = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [withdrawForm, setWithdrawForm] = useState({
    method: '',
    account_details: '',
    amount: ''
  });

  // Fetch earnings to calculate available balance
  const { data: earnings = [] } = useQuery({
    queryKey: ['delivery-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select('amount')
        .eq('delivery_partner_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch withdrawal requests
  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: user?.id,
          ...withdrawalData,
          status: 'pending'
        }]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted and will be processed within 1-3 business days.",
      });
      setWithdrawForm({ method: '', account_details: '', amount: '' });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
  
  const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawForm.amount);
    
    if (!withdrawForm.method || !withdrawForm.account_details || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive"
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive"
      });
      return;
    }

    createWithdrawalMutation.mutate({
      method: withdrawForm.method,
      account_details: withdrawForm.account_details,
      amount: amount
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/delivery-partner/earnings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Withdraw Earnings</h1>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingWithdrawals.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Being processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select 
                value={withdrawForm.method} 
                onValueChange={(value) => setWithdrawForm({...withdrawForm, method: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_details">
                {withdrawForm.method === 'bank_transfer' ? 'Account Number' : 'Wallet ID'}
              </Label>
              <Input
                id="account_details"
                value={withdrawForm.account_details}
                onChange={(e) => setWithdrawForm({...withdrawForm, account_details: e.target.value})}
                placeholder={
                  withdrawForm.method === 'bank_transfer' 
                    ? 'Enter your bank account number' 
                    : 'Enter your wallet ID'
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="100"
                max={availableBalance}
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                placeholder="Enter amount to withdraw"
              />
              <p className="text-xs text-muted-foreground">
                Minimum withdrawal: ₹100 | Available: ₹{availableBalance.toFixed(2)}
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={createWithdrawalMutation.isPending || availableBalance < 100}
              className="w-full"
            >
              {createWithdrawalMutation.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">₹{Number(withdrawal.amount).toFixed(2)}</p>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {withdrawal.method.replace('_', ' ')} - {withdrawal.account_details}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryWithdraw;