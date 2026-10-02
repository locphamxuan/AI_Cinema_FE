'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { ModeTabs, PasswordField, type AuthMode } from './AuthFields';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, latestAdultBirthDate, registrationError } from '@/lib/registration';

// Only the email is remembered; a password never goes to localStorage.
const STORAGE_KEY = 'aicinema_saved_email';
const LEGACY_CREDENTIALS_KEY = 'aicinema_saved_credentials';

const INPUT =
  'w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all';
const LABEL = 'block text-xs font-semibold text-slate-700 dark:text-muted-light mb-1';

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

interface AuthFormProps {
  initialMode: AuthMode;
  initialEmail?: string | null;
  /** Where to go after signing in when the role has no own area (the /login page goes home). */
  fallbackUrl?: string;
}

/**
 * Sign-in, or the sign-up of a viewer account with every field the account keeps (users table):
 * full name, date of birth (18+, BR-54), email and password. Role and status are set by the system.
 */
export default function AuthForm({ initialMode, initialEmail, fallbackUrl }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAppStore();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState(() => initialEmail || savedEmail() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Earlier versions stored the password itself; drop it.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
    } catch {}
  }, []);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
  };

  const signUpError = (): string | null => {
    if (name.trim().length < 2) return 'Họ và tên cần ít nhất 2 ký tự.';
    const problem = registrationError(password, dateOfBirth);
    if (problem) return problem;
    if (password !== confirmPassword) return 'Mật khẩu nhập lại không khớp.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      const problem = signUpError();
      if (problem) {
        setError(problem);
        return;
      }
    }

    setLoading(true);
    const res = mode === 'login' ? await login(email, password) : await register(name, email, password, dateOfBirth);
    setLoading(false);

    if (!res.success) {
      setError(res.error || (mode === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'));
      return;
    }
    rememberEmail(email, rememberMe);
    const target = ('redirectUrl' in res && typeof res.redirectUrl === 'string' ? res.redirectUrl : undefined) || fallbackUrl;
    if (target) router.push(target);
  };

  return (
    <>
      <ModeTabs mode={mode} onChange={switchMode} />

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={mode === 'register'}>
        {mode === 'register' && (
          <>
            <div>
              <label htmlFor="auth-name" className={LABEL}>
                Họ và tên
              </label>
              <input
                id="auth-name"
                type="text"
                required
                autoComplete="name"
                minLength={2}
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Minh Anh"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="auth-dob" className={LABEL}>
                Ngày sinh <span className="font-normal text-slate-500">(từ 18 tuổi)</span>
              </label>
              <input
                id="auth-dob"
                type="date"
                required
                autoComplete="bday"
                max={latestAdultBirthDate()}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`${INPUT} dark:[color-scheme:dark]`}
              />
            </div>
          </>
        )}

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
            placeholder="name@example.com"
            className={`${INPUT} font-medium`}
          />
        </div>

        <PasswordField
          id="auth-password"
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'login' ? 'Nhập mật khẩu...' : `${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} ký tự, có chữ và số`}
        />

        {mode === 'register' && (
          <PasswordField
            id="auth-confirm-password"
            label="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu..."
          />
        )}

        <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer select-none text-slate-600 dark:text-muted-light hover:text-slate-900 dark:hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-white/20 accent-ruby cursor-pointer"
          />
          <span>Ghi nhớ email đăng nhập</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-xl hover:shadow-ruby/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-3 shadow-lg shadow-ruby/20 cursor-pointer"
        >
          {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500 dark:text-muted-light">
        {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-ruby font-bold hover:underline cursor-pointer"
        >
          {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
        </button>
      </p>
    </>
  );
}
