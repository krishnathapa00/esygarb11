import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const DeliveryEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: earnings = [] } = useQuery({
    queryKey: ["delivery-earnings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_earnings")
        .select(
          `
          *,
          orders (
            order_number,
            delivery_address,
            delivered_at
          )
        `
        )
        .eq("delivery_partner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: deliveryConfig } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const totalEarnings = earnings.reduce(
    (sum, earning) => sum + Number(earning.amount),
    0
  );
  const totalDeliveries = earnings.length;
  const averageEarningPerDelivery =
    totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

  const thisMonthEarnings = earnings
    .filter((earning) => {
      const earningDate = new Date(earning.created_at);
      const now = new Date();
      return (
        earningDate.getMonth() === now.getMonth() &&
        earningDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, earning) => sum + Number(earning.amount), 0);

  const formatTime = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/delivery-partner/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Earnings</h1>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalDeliveries} deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {thisMonthEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average per Delivery
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {averageEarningPerDelivery.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per delivery average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Rate */}
      {deliveryConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Current Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              <span className="font-bold">
                Rs {deliveryConfig.delivery_partner_charge}
              </span>{" "}
              per delivery
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is the current rate you earn for each completed delivery
            </p>
          </CardContent>
        </Card>
      )}

      {/* Earnings History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Earnings History</CardTitle>
          <Button onClick={() => navigate("/delivery-partner/withdraw")}>
            Withdraw Earnings
          </Button>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No earnings yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete your first delivery to start earning!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      Order #{earning.orders?.order_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {earning.orders?.delivery_address}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(earning.created_at), "MMM dd, yyyy")}
                      </span>
                      {earning.delivery_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(earning.delivery_time_minutes)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +Rs {Number(earning.amount).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-green-600">
                      Earned
                    </Badge>
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

export default DeliveryEarnings;
