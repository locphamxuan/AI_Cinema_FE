'use client';

import { useAppStore } from '@/store/useAppStore';
import AuthForm from './AuthForm';
import AuthBrand from './AuthBrand';

/** Mounted afresh on every opening, so each opening starts from the saved email and the requested mode. */
export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, initialAuthEmail, closeAuthModal } = useAppStore();
  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      onClick={closeAuthModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đăng nhập hoặc đăng ký"
        className="bg-white dark:bg-[#161922] w-full max-w-md p-6 sm:p-8 my-auto animate-scale-in border border-slate-200 dark:border-white/15 rounded-3xl relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-muted-light dark:hover:text-foreground transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <AuthBrand />
        <AuthForm key={`${authModalMode}:${initialAuthEmail ?? ''}`} initialMode={authModalMode} initialEmail={initialAuthEmail} />
      </div>
    </div>
  );
}
