'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { PasswordField } from './AuthFields';
import { safeNext } from '@/lib/safeNext';

const STORAGE_KEY = 'aicinema_saved_email';
const LEGACY_CREDENTIALS_KEY = 'aicinema_saved_credentials';
/** The login page of Studio Web, opened in this tab: studios sign in there with their own account. */
export const STUDIO_WEB_LOGIN_URL = `${(process.env.NEXT_PUBLIC_STUDIO_WEB_URL?.trim() || 'http://localhost:3100').replace(/\/+$/, '').replace(/\/login$/, '')}/login`;

const INPUT =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';
const LABEL = 'mb-1.5 block text-sm font-medium';

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
  // `?next=` brings the browser back to the page that sent it to /login.
  const next = safeNext(useSearchParams().get('next'));

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
    const target = next ?? res.redirectUrl;
    if (target) router.replace(target);
  };

  const isStudioRefusal = Boolean(error?.includes('Studio Web'));

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <div className="flex items-start gap-2.5">
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
          {isStudioRefusal && (
            <a
              href={STUDIO_WEB_LOGIN_URL}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Mở cổng đăng nhập Studio Web
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
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 cursor-pointer rounded accent-primary"
            />
            <span>Nhớ email trên máy này</span>
          </label>

          <button
            type="button"
            onClick={() => setShowResetHelp((prev) => !prev)}
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Quên mật khẩu?
          </button>
        </div>

        {showResetHelp && (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            Tài khoản nội bộ không tự đặt lại mật khẩu. Vui lòng liên hệ Quản trị viên (Admin) tại mục Tài khoản &amp; Phân quyền để cấp mật khẩu mới.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-10 w-full cursor-pointer rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang xác thực…' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
        <span>Bạn là Studio đối tác?</span>
        <a
          href={STUDIO_WEB_LOGIN_URL}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Đăng nhập Studio Web
        </a>
      </div>
    </>
  );
}
