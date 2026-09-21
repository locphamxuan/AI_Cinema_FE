'use client';

import { create } from 'zustand';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.duration ?? 4500;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'success', title, description, duration });
  },
  error: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'error', title, description, duration });
  },
  warning: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'warning', title, description, duration });
  },
  info: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'info', title, description, duration });
  },
};

const TOAST_STYLES: Record<
  ToastType,
  {
    icon: typeof CheckCircle2;
    iconBoxClass: string;
    borderAccent: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBoxClass: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    borderAccent: 'border-l-4 border-l-emerald-500',
  },
  info: {
    icon: Sparkles,
    iconBoxClass: 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    borderAccent: 'border-l-4 border-l-indigo-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBoxClass: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    borderAccent: 'border-l-4 border-l-amber-500',
  },
  error: {
    icon: AlertCircle,
    iconBoxClass: 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
    borderAccent: 'border-l-4 border-l-rose-500',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((t) => {
        const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white/95 dark:bg-[#151822]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 ${style.borderAccent} rounded-2xl p-4 shadow-xl shadow-slate-900/10 dark:shadow-black/60 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-4 fade-in`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBoxClass}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t.title}
              </h4>
              {t.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              aria-label="Đóng thông báo"
              className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
