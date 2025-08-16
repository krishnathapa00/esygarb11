import { useState, useEffect, useRef } from 'react';

interface UseDeliveryTimerProps {
  orderId: string;
  orderStatus: string;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
}

export const useDeliveryTimer = ({ 
  orderId, 
  orderStatus, 
  onTimerStart, 
  onTimerStop 
}: UseDeliveryTimerProps) => {
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerKey = `delivery_timer_${orderId}`;
  const timerRunningKey = `delivery_timer_running_${orderId}`;
  const timerStartTimeKey = `delivery_timer_start_${orderId}`;

  // Initialize timer from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem(timerKey);
    const savedTimerRunning = localStorage.getItem(timerRunningKey);
    const savedStartTime = localStorage.getItem(timerStartTimeKey);
    
    if (savedTimer) {
      setTimer(parseInt(savedTimer));
    }
    
    if (savedTimerRunning === 'true') {
      setIsTimerRunning(true);
      
      // If timer was running, calculate elapsed time since start
      if (savedStartTime) {
        const startTime = new Date(savedStartTime).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setTimer(elapsedSeconds);
        localStorage.setItem(timerKey, elapsedSeconds.toString());
      }
    }
    
    // Auto-start timer when order is out for delivery
    if (orderStatus === 'out_for_delivery' && savedTimerRunning !== 'true') {
      startTimer();
    }
  }, [orderId, orderStatus]);

  // Timer interval effect
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          localStorage.setItem(timerKey, newTime.toString());
          return newTime;
        });
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
  }, [isTimerRunning, timerKey]);

  const startTimer = () => {
    setIsTimerRunning(true);
    const startTime = new Date().toISOString();
    localStorage.setItem(timerRunningKey, 'true');
    localStorage.setItem(timerStartTimeKey, startTime);
    onTimerStart?.();
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    localStorage.removeItem(timerKey);
    localStorage.removeItem(timerRunningKey);
    localStorage.removeItem(timerStartTimeKey);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onTimerStop?.();
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    localStorage.setItem(timerRunningKey, 'false');
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    localStorage.setItem(timerRunningKey, 'true');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timer,
    isTimerRunning,
    formatTime: () => formatTime(timer),
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  };
};