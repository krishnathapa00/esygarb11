import { useState, useEffect, useRef } from 'react';

interface UseOrderTimerProps {
  orderId: string;
  orderStatus: string;
  orderCreatedAt: string;
  acceptedAt?: string | null;
  deliveredAt?: string | null;
  totalDeliveryMinutes?: number;
}

export const useOrderTimer = ({ 
  orderId, 
  orderStatus, 
  orderCreatedAt,
  acceptedAt,
  deliveredAt,
  totalDeliveryMinutes = 15
}: UseOrderTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(totalDeliveryMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate times based on order status and timestamps
  useEffect(() => {
    if (!orderCreatedAt) return;

    const orderStartTime = new Date(orderCreatedAt).getTime();
    const totalDeliveryMs = totalDeliveryMinutes * 60 * 1000;
    
    if (orderStatus === 'delivered' && deliveredAt) {
      // Order is completed - show final delivery time
      const deliveredTime = new Date(deliveredAt).getTime();
      const finalElapsed = Math.floor((deliveredTime - orderStartTime) / 1000);
      setElapsedSeconds(finalElapsed);
      setRemainingSeconds(0);
      setIsRunning(false);
      return;
    }

    const now = new Date().getTime();
    const currentElapsed = Math.floor((now - orderStartTime) / 1000);
    const currentRemaining = Math.max(0, (totalDeliveryMs - (now - orderStartTime)) / 1000);
    
    setElapsedSeconds(currentElapsed);
    setRemainingSeconds(Math.floor(currentRemaining));

    // Timer should run for active orders
    const activeStatuses = ['confirmed', 'ready_for_pickup', 'dispatched', 'out_for_delivery'];
    const shouldRun = activeStatuses.includes(orderStatus) && currentRemaining > 0;
    setIsRunning(shouldRun);

  }, [orderCreatedAt, orderStatus, deliveredAt, totalDeliveryMinutes]);

  // Main timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const orderStartTime = new Date(orderCreatedAt).getTime();
        const now = new Date().getTime();
        const totalDeliveryMs = totalDeliveryMinutes * 60 * 1000;
        
        const currentElapsed = Math.floor((now - orderStartTime) / 1000);
        const currentRemaining = Math.max(0, (totalDeliveryMs - (now - orderStartTime)) / 1000);
        
        setElapsedSeconds(currentElapsed);
        setRemainingSeconds(Math.floor(currentRemaining));
        
        // Stop timer when time runs out
        if (currentRemaining <= 0) {
          setIsRunning(false);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, orderCreatedAt, totalDeliveryMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeliveryPartnerRemainingTime = () => {
    if (!acceptedAt || orderStatus === 'delivered') return null;
    
    const acceptTime = new Date(acceptedAt).getTime();
    const orderStartTime = new Date(orderCreatedAt).getTime();
    const totalDeliveryMs = totalDeliveryMinutes * 60 * 1000;
    const now = new Date().getTime();
    
    // Calculate how much time was used before delivery partner accepted
    const timeUsedBeforeAccept = acceptTime - orderStartTime;
    const remainingAtAccept = totalDeliveryMs - timeUsedBeforeAccept;
    
    // Calculate current remaining time for delivery partner
    const timeUsedByPartner = now - acceptTime;
    const partnerRemaining = Math.max(0, (remainingAtAccept - timeUsedByPartner) / 1000);
    
    return Math.floor(partnerRemaining);
  };

  return {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    formatElapsed: () => formatTime(elapsedSeconds),
    formatRemaining: () => formatTime(remainingSeconds),
    deliveryPartnerRemaining: getDeliveryPartnerRemainingTime(),
    formatDeliveryPartnerRemaining: () => {
      const partnerRemaining = getDeliveryPartnerRemainingTime();
      return partnerRemaining !== null ? formatTime(partnerRemaining) : null;
    },
    isOverdue: remainingSeconds === 0 && orderStatus !== 'delivered'
  };
};