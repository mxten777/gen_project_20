// src/components/connection-status.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
// Local storage mode - no Firebase connection monitoring

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Monitor network connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Show status when connection changes (use requestAnimationFrame to avoid sync setState)
    let hideTimer: number;

    const showTimer = requestAnimationFrame(() => {
      setShowStatus(true);
      hideTimer = setTimeout(() => setShowStatus(false), 3000);
    });

    return () => {
      cancelAnimationFrame(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOnline]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: '오프라인',
        color: 'bg-red-500',
        textColor: 'text-red-100'
      };
    } else {
      return {
        icon: Wifi,
        text: '로컬 모드',
        color: 'bg-blue-500',
        textColor: 'text-blue-100'
      };
    }
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 ${className}`}
        >
          <div className={`${status.color} ${status.textColor} px-3 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{status.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Persistent indicator (always visible, smaller)
export function ConnectionIndicator({ className = '' }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: '오프라인',
        color: 'bg-red-500',
        textColor: 'text-red-100'
      };
    } else {
      return {
        icon: Wifi,
        text: '로컬',
        color: 'bg-blue-500',
        textColor: 'text-blue-100'
      };
    }
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  return (
    <div className={`${status.color} ${status.textColor} px-2 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm ${className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{status.text}</span>
    </div>
  );
}