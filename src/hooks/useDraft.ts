import { useState, useEffect } from 'react';
import { get, set, del } from 'idb-keyval';

export function useDraft<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial value from IndexedDB
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const saved = await get(`pikkolo_draft_${key}`);
        if (saved !== undefined) {
          setState(saved);
        }
      } catch (error) {
        console.error(`Error loading draft for ${key}:`, error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadDraft();
  }, [key]);

  // Save to IndexedDB whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    const saveDraft = async () => {
      try {
        await set(`pikkolo_draft_${key}`, state);
      } catch (error) {
        console.error(`Error saving draft for ${key}:`, error);
      }
    };
    saveDraft();
  }, [key, state, isLoaded]);

  const clearDraft = async () => {
    try {
      await del(`pikkolo_draft_${key}`);
      setState(initialValue);
    } catch (error) {
      console.error(`Error clearing draft for ${key}:`, error);
    }
  };

  return [state, setState, clearDraft] as const;
}
