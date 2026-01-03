import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CANCEL_WINDOW_MS = 1 * 60 * 1000;

const getRemainingSeconds = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) return 0;

  const remaining = CANCEL_WINDOW_MS - (Date.now() - createdTime);
  return Math.max(0, Math.floor(remaining / 1000));
};

export const useCancelOrder = (
  orderId: string,
  userId: string,
  createdAt: string,
  status: string,
  onCancelled?: () => void
) => {
  const [remainingSeconds, setRemainingSeconds] = useState(
    getRemainingSeconds(createdAt)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(createdAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const cancelOrder = async () => {
    if (remainingSeconds <= 0 || loading) return;

    setLoading(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("order_number", orderId)
      .eq("user_id", userId);

    setLoading(false);

    if (!error) {
      onCancelled?.();
    }
  };

  return {
    canCancel: remainingSeconds > 0 && status.toLowerCase() !== "cancelled",
    remainingSeconds,
    cancelOrder,
    loading,
  };
};
