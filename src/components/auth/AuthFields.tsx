'use client';

import { useState } from 'react';

export type AuthMode = 'login' | 'register';

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Đăng Nhập' },
  { mode: 'register', label: 'Đăng Ký' },
];

export function ModeTabs({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  return (
    <div className="flex bg-slate-100 dark:bg-black/40 rounded-xl p-1 mb-5 border border-slate-200 dark:border-white/10">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          onClick={() => onChange(tab.mode)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === tab.mode
              ? 'bg-ruby text-white shadow-md shadow-ruby/30'
              : 'text-slate-600 dark:text-muted-light hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </>
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
        />
      )}
    </svg>
  );
}

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** Password input with a show/hide toggle. */
export function PasswordField({ value, onChange, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-700 dark:text-muted-light">Mật khẩu</label>
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-muted-light hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <EyeIcon open={!visible} />
          <span>{visible ? 'Ẩn' : 'Hiện'}</span>
        </button>
      </div>
      <input
        type={visible ? 'text' : 'password'}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all font-medium"
      />
    </div>
  );
}
