'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { PasswordField } from './AuthFields';

const STORAGE_KEY = 'aicinema_saved_email';
const LEGACY_CREDENTIALS_KEY = 'aicinema_saved_credentials';
const STUDIO_WEB_LOGIN_URL = process.env.NEXT_PUBLIC_STUDIO_WEB_URL?.trim() || 'http://localhost:3100/login';

const INPUT =
  'w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-white dark:focus:bg-white/[0.06] dark:focus:ring-white/15';
const LABEL = 'mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300';

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

/** Sign-in form of the back office, with remembered email, password toggle, and Studio Web link. */
export default function AuthForm() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState(() => savedEmail() || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetHelp, setShowResetHelp] = useState(false);
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

    toast.success('Đăng nhập thành công!', 'Chào mừng bạn quay trở lại cổng nội bộ AI Cinema.');
    rememberEmail(email, rememberMe);
    if (res.redirectUrl) router.push(res.redirectUrl);
  };

  const isStudioRefusal = Boolean(error?.includes('Studio Web'));

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
          {isStudioRefusal && (
            <a
              href={STUDIO_WEB_LOGIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black dark:bg-white dark:text-slate-900"
            >
              Mở cổng đăng nhập Studio Web <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
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
            placeholder="ten@aicinema.vn"
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
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900 dark:border-white/20 dark:accent-white"
            />
            <span>Nhớ email trên máy này</span>
          </label>

          <button
            type="button"
            onClick={() => setShowResetHelp((prev) => !prev)}
            className="cursor-pointer text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Quên mật khẩu?
          </button>
        </div>

        {showResetHelp && (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            Tài khoản nội bộ không tự đặt lại mật khẩu. Vui lòng liên hệ Quản trị viên (Admin) tại mục Tài khoản &amp; Phân quyền để cấp mật khẩu mới.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded-full bg-[#121212] py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? 'Đang xác thực…' : 'Đăng Nhập'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
        <span>Bạn là Studio đối tác?</span>
        <a
          href={STUDIO_WEB_LOGIN_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline dark:text-white"
        >
          Đăng nhập Studio Web <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </>
  );
}
