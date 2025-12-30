import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import AdminLayout from "./components/AdminLayout";

const DeliverySettings = () => {
  const [deliveryFee, setDeliveryFee] = useState("");
  const [partnerCharge, setPartnerCharge] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (config) {
      setDeliveryFee(config.delivery_fee.toString());
      setPartnerCharge(config.delivery_partner_charge.toString());
    }
  }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: async ({
      deliveryFee,
      partnerCharge,
    }: {
      deliveryFee: string;
      partnerCharge: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!config?.id) {
        // Create new config if none exists
        const { error } = await supabase.from("delivery_config").insert({
          delivery_fee: parseFloat(deliveryFee),
          delivery_partner_charge: parseFloat(partnerCharge),
          updated_by: user?.id,
        });
        if (error) throw error;
      } else {
        // Update existing config
        const { error } = await supabase
          .from("delivery_config")
          .update({
            delivery_fee: parseFloat(deliveryFee),
            delivery_partner_charge: parseFloat(partnerCharge),
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq("id", config.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      // Also invalidate cart and checkout related queries to update delivery fees
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["checkout"] });
      toast({
        title: "Success",
        description: "Delivery settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update delivery settings.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(deliveryFee) < 0 || Number(partnerCharge) < 0) {
      toast({
        title: "Invalid values",
        description: "Delivery fee and partner charge cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    updateConfigMutation.mutate({ deliveryFee, partnerCharge });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Loading delivery settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Delivery Settings</h1>
        </div>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Delivery Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Delivery Fee (Customer pays)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This fee will be added to customer orders during checkout
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Delivery Partner Charge
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="30.00"
                  value={partnerCharge}
                  onChange={(e) => setPartnerCharge(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Amount paid to delivery partner per completed order
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateConfigMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DeliverySettings;
