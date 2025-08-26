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
  totalDeliveryMinutes = 10
}: UseOrderTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(totalDeliveryMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
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
      setRemainingSeconds(totalDeliveryMs / 1000 - finalElapsed);
      setIsRunning(false);
      setIsOverdue(finalElapsed > totalDeliveryMs / 1000);
      return;
    }

    const now = new Date().getTime();
    const currentElapsed = Math.floor((now - orderStartTime) / 1000);
    const timeFromStart = now - orderStartTime;
    const currentRemaining = (totalDeliveryMs - timeFromStart) / 1000;
    
    setElapsedSeconds(currentElapsed);
    setRemainingSeconds(Math.floor(currentRemaining));
    setIsOverdue(currentRemaining <= 0);

    // Timer should run for active orders regardless of remaining time
    const activeStatuses = ['confirmed', 'ready_for_pickup', 'dispatched', 'out_for_delivery', 'pending'];
    const shouldRun = activeStatuses.includes(orderStatus);
    setIsRunning(shouldRun);

  }, [orderCreatedAt, orderStatus, deliveredAt, totalDeliveryMinutes]);

  // Main timer interval - runs continuously when active
  useEffect(() => {
    if (isRunning && orderCreatedAt) {
      intervalRef.current = setInterval(() => {
        const orderStartTime = new Date(orderCreatedAt).getTime();
        const now = new Date().getTime();
        const totalDeliveryMs = totalDeliveryMinutes * 60 * 1000;
        const timeFromStart = now - orderStartTime;
        
        const currentElapsed = Math.floor(timeFromStart / 1000);
        const currentRemaining = (totalDeliveryMs - timeFromStart) / 1000;
        
        setElapsedSeconds(currentElapsed);
        setRemainingSeconds(Math.floor(currentRemaining));
        setIsOverdue(currentRemaining <= 0);
        
        // Keep timer running for active orders even when overdue
        const activeStatuses = ['confirmed', 'ready_for_pickup', 'dispatched', 'out_for_delivery', 'pending'];
        if (!activeStatuses.includes(orderStatus)) {
          setIsRunning(false);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, orderCreatedAt, orderStatus, totalDeliveryMinutes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return isNegative ? `-${timeString}` : timeString;
  };

  const getDisplayMessage = () => {
    if (orderStatus === 'delivered') {
      return 'Order delivered';
    }
    if (isOverdue) {
      return 'Slight delay — your order is being delivered!';
    }
    return 'Expected delivery time';
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
    const partnerRemaining = (remainingAtAccept - timeUsedByPartner) / 1000;
    
    return Math.floor(partnerRemaining);
  };

  return {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    isOverdue: isOverdue && orderStatus !== 'delivered',
    displayMessage: getDisplayMessage(),
    formatElapsed: () => formatTime(elapsedSeconds),
    formatRemaining: () => formatTime(remainingSeconds),
    deliveryPartnerRemaining: getDeliveryPartnerRemainingTime(),
    formatDeliveryPartnerRemaining: () => {
      const partnerRemaining = getDeliveryPartnerRemainingTime();
      return partnerRemaining !== null ? formatTime(partnerRemaining) : null;
    }
  };
};