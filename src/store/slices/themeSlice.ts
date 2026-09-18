import type { StateCreator } from 'zustand';
import type { AppState, ThemeSlice } from './types';

export const createThemeSlice: StateCreator<AppState, [], [], ThemeSlice> = (set, get) => ({
  theme: 'light', // Default Light Mode
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('ai_cinema_theme', theme);
      } catch {}
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
});
