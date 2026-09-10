'use client';

import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center h-8.5 w-[70px] p-1 rounded-full transition-all duration-300 cursor-pointer select-none group shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-800 border-2 border-slate-600 hover:border-indigo-400 hover:shadow-indigo-500/20'
          : 'bg-amber-100/90 border-2 border-amber-400 hover:border-amber-500 hover:shadow-amber-500/20'
      }`}
      title={isDark ? 'Đang ở Giao diện Tối • Bấm để đổi sang Tone Sáng' : 'Đang ở Giao diện Sáng • Bấm để đổi sang Tone Tối'}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
    >
      {/* Background static icons */}
      <div className="w-full flex items-center justify-between px-1.5 pointer-events-none">
        {/* Sun side */}
        <svg
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isDark ? 'text-slate-500 opacity-40 scale-90' : 'text-amber-600 opacity-100 scale-100'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity={0.4} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m11.32-11.32l1.41-1.41"
          />
        </svg>

        {/* Moon side */}
        <svg
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isDark ? 'text-indigo-300 opacity-100 scale-100' : 'text-slate-400 opacity-40 scale-90'
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>

      {/* Sliding Knob Thumb */}
      <span
        className={`absolute top-0.5 bottom-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-md ${
          isDark
            ? 'left-[calc(100%-1.75rem)] bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white ring-1 ring-indigo-300/40'
            : 'left-0.5 bg-white text-amber-500 ring-1 ring-amber-300 shadow-[0_2px_6px_rgba(245,158,11,0.3)]'
        }`}
      >
        {isDark ? (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="3.5" fill="#F59E0B" fillOpacity={0.8} stroke="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m11.32-11.32l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}
