import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./use-toast";

const playAlertSound = () => {
  const audio = new Audio("/sounds/notification.wav");

  audio.play().catch((error) => {
    console.error("Error playing alert sound:", error);
  });
};

export const useOrderAlert = (onNewOrder?: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          playAlertSound();
          toast({
            title: `New order placed: #${payload.new.order_number}`,
            variant: "default",
          });
          if (onNewOrder) onNewOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewOrder]);
};
