/**
 * AI Cinema - Type-safe LocalStorage helper
 */

export const STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'ai_cinema_remembered_email',
} as const;

export const storage = {
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Error saving to localStorage key "${key}":`, e);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing localStorage key "${key}":`, e);
    }
  },
};
