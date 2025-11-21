// src/hooks/useFirestore.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  onSnapshot, 
  getDoc, 
  updateDoc,
  type Unsubscribe,
  type FirestoreError 
} from 'firebase/firestore';
import { db } from '@/firebase';

interface FirestoreHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  update: (data: Partial<T>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFirestoreDoc<T>(
  path: string,
  fallbackKey?: string
): FirestoreHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!db || !path) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setData(docSnap.data() as T);
        setError(null);
      } else if (fallbackKey) {
        // Try localStorage fallback
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          setData(JSON.parse(fallbackData));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Firestore fetch error:', err);
      
      // Fallback to localStorage
      if (fallbackKey) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          setData(JSON.parse(fallbackData));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [path, fallbackKey]);

  // Update function
  const update = useCallback(async (updateData: Partial<T>) => {
    if (!db || !path) {
      // Fallback to localStorage
      if (fallbackKey && data) {
        const updated = { ...data, ...updateData };
        localStorage.setItem(fallbackKey, JSON.stringify(updated));
        setData(updated);
      }
      return;
    }

    try {
      const docRef = doc(db, path);
      await updateDoc(docRef, updateData);
      
      // Also update localStorage as backup
      if (fallbackKey && data) {
        const updated = { ...data, ...updateData };
        localStorage.setItem(fallbackKey, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Firestore update error:', err);
      
      // Fallback to localStorage
      if (fallbackKey && data) {
        const updated = { ...data, ...updateData };
        localStorage.setItem(fallbackKey, JSON.stringify(updated));
        setData(updated);
      }
      
      throw err;
    }
  }, [path, fallbackKey, data]);

  useEffect(() => {
    if (!path) return;

    let unsubscribe: Unsubscribe | undefined;

    if (db) {
      // Use Firestore with real-time updates
      const docRef = doc(db, path);
      
      unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          setLoading(false);
          if (doc.exists()) {
            const docData = doc.data() as T;
            setData(docData);
            setError(null);
            
            // Backup to localStorage
            if (fallbackKey) {
              localStorage.setItem(fallbackKey, JSON.stringify(docData));
            }
          } else if (fallbackKey) {
            // Try localStorage fallback
            const fallbackData = localStorage.getItem(fallbackKey);
            if (fallbackData) {
              setData(JSON.parse(fallbackData));
            }
          }
        },
        (error: FirestoreError) => {
          console.error('Firestore listener error:', error);
          setError(error.message);
          setLoading(false);
          
          // Fallback to localStorage
          if (fallbackKey) {
            const fallbackData = localStorage.getItem(fallbackKey);
            if (fallbackData) {
              setData(JSON.parse(fallbackData));
            }
          }
        }
      );
    } else {
      // Use localStorage only
      setLoading(true);
      if (fallbackKey) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          setData(JSON.parse(fallbackData));
        }
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [path, fallbackKey]);

  return { data, loading, error, update, refresh };
}

// useFirestoreCollection can be implemented when needed