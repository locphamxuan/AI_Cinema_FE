'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { PasswordField } from './AuthFields';

const STORAGE_KEY = 'aicinema_saved_email';
const LEGACY_CREDENTIALS_KEY = 'aicinema_saved_credentials';

const INPUT =
  'w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-2 focus:ring-ruby/20 transition-all font-medium';
const LABEL = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';

function savedEmail(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function rememberEmail(email: string, remember: boolean) {
  try {
    if (remember) localStorage.setItem(STORAGE_KEY, email.trim());
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Sign-in form of the back office, with a remembered email and a clear password toggle. */
export default function AuthForm() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState(() => savedEmail() || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu.');
      return;
    }

    toast.success('Đăng nhập thành công!', 'Chào mừng bạn quay trở lại với AI Cinema.');

    rememberEmail(email, rememberMe);
    if (res.redirectUrl) router.push(res.redirectUrl);
  };

  return (
    <>
      {error && (
        <div role="alert" className="mb-4 p-3.5 rounded-2xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2.5 animate-slide-up">
          <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="auth-email" className={LABEL}>
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ten@email.com"
            className={INPUT}
          />
        </div>

        <PasswordField
          id="auth-password"
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 text-xs cursor-pointer select-none text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-lg border-slate-300 dark:border-white/20 accent-ruby cursor-pointer"
            />
            <span>Nhớ đăng nhập trên máy này</span>
          </label>

          <span className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Quên mật khẩu?
            </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-ruby to-action-strong hover:shadow-xl hover:shadow-ruby/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-ruby/20 cursor-pointer text-sm"
        >
          {loading ? 'Đang xác thực…' : 'Đăng Nhập'}
        </button>
      </form>

    </>
  );
}
