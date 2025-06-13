
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, orderId, onSuccess, onError }) => {
  const [selectedMethod, setSelectedMethod] = useState<'esewa' | 'khalti' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEsewaPayment = async () => {
    setLoading(true);
    try {
      // eSewa integration
      const esewaPath = "https://uat.esewa.com.np/epay/main";
      const params = {
        amt: amount,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: amount,
        pid: orderId,
        scd: 'EPAYTEST', // Use your actual merchant code
        su: `${window.location.origin}/payment-success`,
        fu: `${window.location.origin}/payment-failure`
      };

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = esewaPath;

      Object.keys(params).forEach(key => {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key as keyof typeof params].toString();
        form.appendChild(hiddenField);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setLoading(false);
      onError('eSewa payment failed');
    }
  };

  const handleKhaltiPayment = async () => {
    setLoading(true);
    try {
      // Khalti integration
      const config = {
        publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a507256', // Use your actual public key
        productIdentity: orderId,
        productName: 'EsyGrab Order',
        productUrl: window.location.origin,
        paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
        eventHandler: {
          onSuccess(payload: any) {
            console.log(payload);
            onSuccess(payload.token);
            setLoading(false);
          },
          onError(error: any) {
            console.log(error);
            onError('Khalti payment failed');
            setLoading(false);
          },
          onClose() {
            console.log('Payment widget closed');
            setLoading(false);
          }
        }
      };

      // This would typically use the Khalti SDK
      // For now, we'll simulate the payment
      setTimeout(() => {
        onSuccess('mock_khalti_token_' + Date.now());
        setLoading(false);
      }, 2000);
    } catch (error) {
      setLoading(false);
      onError('Khalti payment failed');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${selectedMethod === 'esewa' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setSelectedMethod('esewa')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              eSewa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Digital wallet payment</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedMethod === 'khalti' ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => setSelectedMethod('khalti')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <Smartphone className="h-4 w-4 mr-2" />
              Khalti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Mobile wallet payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <p className="text-lg font-semibold mb-4">Amount: Rs {amount}</p>
        
        {selectedMethod === 'esewa' && (
          <Button 
            onClick={handleEsewaPayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Pay with eSewa'}
          </Button>
        )}

        {selectedMethod === 'khalti' && (
          <Button 
            onClick={handleKhaltiPayment}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Processing...' : 'Pay with Khalti'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
