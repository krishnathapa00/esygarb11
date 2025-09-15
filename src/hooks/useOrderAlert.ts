import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/components/Toast";

const playAlertSound = () => {
  const audio = new Audio("/sounds/notification.wav");

  
  const play = () => {
    const newAudio = new Audio("/sounds/notification.wav");
    newAudio.play().catch((error) => {
      console.error("Error playing alert sound:", error);
    });
  };

  play();

  const interval = setInterval(play, 5000);

  setTimeout(() => {
    clearInterval(interval);
  }, 5 * 1000);
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
          showToast(`New order placed: #${payload.new.order_number}`, "info");
          if (onNewOrder) onNewOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewOrder]);
};
