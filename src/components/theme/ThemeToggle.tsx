'use client';

import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useAppStore();

  useEffect(() => {
    // Read theme preference from localStorage or default to light
    try {
      const savedTheme = localStorage.getItem('ai_cinema_theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark') {
        setTheme('dark');
      } else {
        setTheme('light');
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      setTheme('light');
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [setTheme]);

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-200 border border-slate-300/80 dark:border-white/15 hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer shadow-sm"
      title={isDark ? 'Chuyển sang chế độ Sáng (Light Mode)' : 'Chuyển sang chế độ Tối (Cinema Dark)'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        // Sun Icon
        <svg className="w-4 h-4 text-amber-400 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon
        <svg className="w-4 h-4 text-slate-700 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
