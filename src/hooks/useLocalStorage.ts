// src/hooks/useLocalStorage.ts - localStorage 기반 데이터 관리 훅
import { useState, useEffect, useCallback } from 'react';

interface LocalStorageHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  update: (data: Partial<T>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): LocalStorageHookReturn<T> {
  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setData(defaultValue);
      }
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  // Update data in localStorage
  const update = useCallback(async (newData: Partial<T>) => {
    try {
      const currentData = data || {};
      const updatedData = { ...currentData, ...newData };
      localStorage.setItem(key, JSON.stringify(updatedData));
      setData(updatedData as T);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [key, data]);

  // Refresh data
  const refresh = useCallback(async () => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    update,
    refresh
  };
}

// Utility function to get data from localStorage
export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Utility function to set data in localStorage
export function setLocalStorageItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Utility function to remove data from localStorage
export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to remove from localStorage:', err);
  }
}