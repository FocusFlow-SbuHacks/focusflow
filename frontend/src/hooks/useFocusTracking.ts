import { useEffect, useRef, useState, useCallback } from 'react';

interface FocusMetrics {
  typingSpeed: number; // keys per minute
  idleTime: number; // seconds
  tabSwitches: number;
}

export const useFocusTracking = (isActive: boolean, onDataUpdate?: (metrics: FocusMetrics) => void) => {
  const [metrics, setMetrics] = useState<FocusMetrics>({
    typingSpeed: 0,
    idleTime: 0,
    tabSwitches: 0,
  });

  const keyPressCountRef = useRef(0);
  const lastKeyPressTimeRef = useRef(Date.now());
  const idleStartTimeRef = useRef<number | null>(null);
  const tabSwitchCountRef = useRef(0);
  const lastTabSwitchTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingSpeedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsRef = useRef<FocusMetrics>({ typingSpeed: 0, idleTime: 0, tabSwitches: 0 });

  // Track typing speed
  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = () => {
      keyPressCountRef.current++;
      lastKeyPressTimeRef.current = Date.now();
      
      // Reset idle time on activity
      if (idleStartTimeRef.current !== null) {
        idleStartTimeRef.current = null;
      }
    };

    // Calculate typing speed every 10 seconds
    typingSpeedIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastKeyPressTimeRef.current) / 1000 / 60; // minutes
      
      if (timeDiff > 0) {
        const keysPerMinute = keyPressCountRef.current / timeDiff;
        const newTypingSpeed = Math.round(keysPerMinute);
        setMetrics(prev => {
          const updated = { ...prev, typingSpeed: newTypingSpeed };
          metricsRef.current = updated;
          return updated;
        });
        keyPressCountRef.current = 0;
        lastKeyPressTimeRef.current = now;
      }
    }, 10000);

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousedown', handleKeyPress);
    window.addEventListener('mousemove', handleKeyPress);
    window.addEventListener('scroll', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleKeyPress);
      window.removeEventListener('mousemove', handleKeyPress);
      window.removeEventListener('scroll', handleKeyPress);
      if (typingSpeedIntervalRef.current) {
        clearInterval(typingSpeedIntervalRef.current);
      }
    };
  }, [isActive]);

  // Track idle time
  useEffect(() => {
    if (!isActive) {
      idleStartTimeRef.current = null;
      setMetrics(prev => ({ ...prev, idleTime: 0 }));
      return;
    }

    let lastActivityTime = Date.now();
    let mouseMoveThrottle = 0;

    const handleActivity = () => {
      lastActivityTime = Date.now();
      idleStartTimeRef.current = null;
      // Reset idle time immediately when activity detected
      setMetrics(prev => {
        const updated = { ...prev, idleTime: 0 };
        metricsRef.current = updated;
        return updated;
      });
    };

    // Only track meaningful mouse movements (throttled)
    const handleMouseMove = () => {
      mouseMoveThrottle++;
      // Only count mouse movement as activity every 10th movement
      // This prevents tiny movements from resetting idle time
      if (mouseMoveThrottle >= 10) {
        handleActivity();
        mouseMoveThrottle = 0;
      }
    };

    const checkIdle = () => {
      const now = Date.now();
      const timeSinceLastActivity = (now - lastActivityTime) / 1000; // seconds
      
      if (timeSinceLastActivity > 1) {
        // User is idle
        if (idleStartTimeRef.current === null) {
          idleStartTimeRef.current = lastActivityTime;
        }
        const idleSeconds = Math.floor((now - idleStartTimeRef.current) / 1000);
        setMetrics(prev => {
          const updated = { ...prev, idleTime: idleSeconds };
          metricsRef.current = updated;
          return updated;
        });
      }
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('mousemove', handleMouseMove);

    const idleInterval = setInterval(checkIdle, 1000);
    
    return () => {
      clearInterval(idleInterval);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isActive]);

  // Track tab switches and page visibility
  useEffect(() => {
    if (!isActive) return;

    let lastVisibilityChange = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastVisibilityChange = Date.now();
      } else {
        // User came back to tab
        const timeAway = Date.now() - lastVisibilityChange;
        if (timeAway > 2000) {
          // Only count if away for more than 2 seconds
          tabSwitchCountRef.current++;
          setMetrics(prev => {
            const updated = { ...prev, tabSwitches: tabSwitchCountRef.current };
            metricsRef.current = updated;
            return updated;
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Send data updates periodically
  useEffect(() => {
    console.log("🎯 useFocusTracking: Setting up interval", { isActive, hasCallback: !!onDataUpdate });
    
    if (!isActive || !onDataUpdate) {
      console.log("⏸️ useFocusTracking: Not active or no callback", { isActive, hasCallback: !!onDataUpdate });
      return;
    }

    console.log("✅ useFocusTracking: Starting tracking interval (5 seconds)");
    
    intervalRef.current = setInterval(() => {
      const currentMetrics = {
        typingSpeed: metricsRef.current.typingSpeed,
        idleTime: metricsRef.current.idleTime,
        tabSwitches: metricsRef.current.tabSwitches,
      };
      console.log("📊 useFocusTracking: Sending metrics:", currentMetrics);
      onDataUpdate(currentMetrics);
    }, 5000); // Every 5 seconds

    return () => {
      console.log("🛑 useFocusTracking: Cleaning up interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onDataUpdate]);

  const resetMetrics = useCallback(() => {
    const reset = {
      typingSpeed: 0,
      idleTime: 0,
      tabSwitches: 0,
    };
    setMetrics(reset);
    metricsRef.current = reset;
    keyPressCountRef.current = 0;
    idleStartTimeRef.current = null;
    tabSwitchCountRef.current = 0;
    lastKeyPressTimeRef.current = Date.now();
    lastTabSwitchTimeRef.current = Date.now();
  }, []);

  return {
    metrics,
    resetMetrics,
  };
};

