// src/components/connection-status.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { db } from '@/firebase';
// Firebase connection monitoring without Firestore listeners

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
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
    // Monitor Firebase connectivity with a more reliable method
    const testConnection = async () => {
      if (!db) {
        setIsFirebaseConnected(false);
        return;
      }

      try {
        // Just try to access the Firebase instance without creating listeners
        if (db.app) {
          setIsFirebaseConnected(true);
        }
      } catch (error) {
        console.warn('Firebase connection test failed:', error);
        setIsFirebaseConnected(false);
      }
    };

    // Initial test with slight delay
    const initialTimer = setTimeout(testConnection, 100);
    
    // Periodic check every 30 seconds
    const interval = setInterval(testConnection, 30000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Show status when connection changes (use requestAnimationFrame to avoid sync setState)
    let hideTimer: NodeJS.Timeout;
    
    const showTimer = requestAnimationFrame(() => {
      setShowStatus(true);
      hideTimer = setTimeout(() => setShowStatus(false), 3000);
    });
    
    return () => {
      cancelAnimationFrame(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOnline, isFirebaseConnected]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: '오프라인',
        color: 'bg-red-500',
        textColor: 'text-red-100'
      };
    } else if (db && !isFirebaseConnected) {
      return {
        icon: CloudOff,
        text: '동기화 대기',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-100'
      };
    } else if (db && isFirebaseConnected) {
      return {
        icon: Cloud,
        text: '실시간 연결됨',
        color: 'bg-green-500',
        textColor: 'text-green-100'
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
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

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

  useEffect(() => {
    // Simple Firebase connection check without creating unnecessary listeners
    const checkConnection = () => {
      if (!db) {
        setIsFirebaseConnected(false);
        return;
      }
      
      try {
        if (db.app) {
          setIsFirebaseConnected(true);
        }
      } catch {
        setIsFirebaseConnected(false);
      }
    };

    const timer = setTimeout(checkConnection, 100);
    const interval = setInterval(checkConnection, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getColor = () => {
    if (!isOnline) return 'bg-red-400';
    if (db && !isFirebaseConnected) return 'bg-yellow-400';
    if (db && isFirebaseConnected) return 'bg-green-400';
    return 'bg-blue-400';
  };

  return (
    <motion.div
      className={`w-3 h-3 rounded-full ${getColor()} ${className}`}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}