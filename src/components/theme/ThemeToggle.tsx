'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const subscribeNoop = () => () => {};

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useAppStore();
  // false during SSR/hydration, true on the client — avoids a hydration mismatch without an effect.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    try {
      setTheme(localStorage.getItem('ai_cinema_theme') === 'dark' ? 'dark' : 'light');
    } catch {
      setTheme('light');
    }
  }, [setTheme]);

  const isDark = mounted && theme === 'dark';
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
      title={isDark ? 'Đang ở giao diện tối — bấm để đổi sang sáng' : 'Đang ở giao diện sáng — bấm để đổi sang tối'}
      aria-label="Chuyển đổi giao diện sáng / tối"
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
