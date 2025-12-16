import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, CreditCard, Building2, ArrowRight, CheckCircle, DollarSign } from 'lucide-react';

interface EarningsTransferProps {
  totalEarnings: number;
  availableEarnings: number;
}

const EarningsTransfer: React.FC<EarningsTransferProps> = ({ totalEarnings, availableEarnings }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMethod, setTransferMethod] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [esewaNumber, setEsewaNumber] = useState('');
  const [khaltiNumber, setKhaltiNumber] = useState('');

  const transferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      // In a real app, this would call a payment gateway API
      // For now, we'll simulate the transfer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the transfer in database (you could create a transfers table)
      console.log('Transfer initiated:', transferData);
      
      return { success: true, transactionId: `TXN${Date.now()}` };
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Initiated",
        description: `Transfer of Rs ${transferAmount} has been initiated. Transaction ID: ${data.transactionId}`
      });
      setTransferAmount('');
      setTransferMethod('');
      setBankAccount('');
      setBankName('');
      setAccountHolder('');
      setEsewaNumber('');
      setKhaltiNumber('');
      queryClient.invalidateQueries({ queryKey: ['delivery-profile-stats'] });
    },
    onError: () => {
      toast({
        title: "Transfer Failed",
        description: "Failed to initiate transfer. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleTransfer = () => {
    if (!transferAmount || !transferMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount <= 0 || amount > availableEarnings) {
      toast({
        title: "Invalid Amount",
        description: `Please enter an amount between Rs 1 and Rs ${availableEarnings.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (transferMethod === 'bank' && (!bankAccount || !bankName || !accountHolder)) {
      toast({
        title: "Bank Details Required",
        description: "Please provide complete bank account details.",
        variant: "destructive"
      });
      return;
    }

    if (transferMethod === 'esewa' && !esewaNumber) {
      toast({
        title: "eSewa Number Required",
        description: "Please provide your eSewa mobile number.",
        variant: "destructive"
      });
      return;
    }

    if (transferMethod === 'khalti' && !khaltiNumber) {
      toast({
        title: "Khalti Number Required",
        description: "Please provide your Khalti mobile number.",
        variant: "destructive"
      });
      return;
    }

    const transferData = {
      userId: user?.id,
      amount,
      method: transferMethod,
      ...(transferMethod === 'bank' && { bankAccount, bankName, accountHolder }),
      ...(transferMethod === 'esewa' && { esewaNumber }),
      ...(transferMethod === 'khalti' && { khaltiNumber }),
      timestamp: new Date().toISOString()
    };

    transferMutation.mutate(transferData);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Wallet className="h-5 w-5" />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600">Total Earnings</p>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">Rs</span>
                <span className="text-2xl font-bold text-green-800">{totalEarnings.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-green-600">Available for Transfer</p>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">Rs</span>
                <span className="text-2xl font-bold text-green-800">{availableEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Transfer Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Transfer Amount (Rs)</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="pl-10"
                max={availableEarnings}
                min="1"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum: Rs {availableEarnings.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="method">Transfer Method</Label>
            <Select value={transferMethod} onValueChange={setTransferMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select transfer method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esewa">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    eSewa
                  </div>
                </SelectItem>
                <SelectItem value="khalti">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Khalti
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Account
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferMethod === 'esewa' && (
            <div>
              <Label htmlFor="esewaNumber">eSewa Mobile Number</Label>
              <Input
                id="esewaNumber"
                value={esewaNumber}
                onChange={(e) => setEsewaNumber(e.target.value)}
                placeholder="98XXXXXXXX"
                className="mt-1"
              />
            </div>
          )}

          {transferMethod === 'khalti' && (
            <div>
              <Label htmlFor="khaltiNumber">Khalti Mobile Number</Label>
              <Input
                id="khaltiNumber"
                value={khaltiNumber}
                onChange={(e) => setKhaltiNumber(e.target.value)}
                placeholder="98XXXXXXXX"
                className="mt-1"
              />
            </div>
          )}

          {transferMethod === 'bank' && (
            <>
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Nepal Investment Bank"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full name as per bank account"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input
                  id="bankAccount"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Bank account number"
                  className="mt-1"
                />
              </div>
            </>
          )}

          <Button
            onClick={handleTransfer}
            disabled={transferMutation.isPending || !transferAmount || !transferMethod || availableEarnings <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {transferMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Transfer...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Initiate Transfer
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transfer Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Transfer Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Bank transfers typically take 1-3 business days</li>
              <li>• eSewa and Khalti transfers are usually instant</li>
              <li>• Minimum transfer amount: Rs 100</li>
              <li>• No transfer fees for verified accounts</li>
              <li>• Ensure your account details are correct to avoid delays</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsTransfer;