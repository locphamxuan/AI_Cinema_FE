'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Calendar, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { APPLICATION_MESSAGES } from '@/lib/applicationMessages';
import { ModeTabs, PasswordField, type AuthMode } from './AuthFields';
import GoogleSignInButton from './GoogleSignInButton';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, latestAdultBirthDate, registrationError } from '@/lib/registration';

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

interface AuthFormProps {
  initialMode: AuthMode;
  initialEmail?: string | null;
  /** Where to go after signing in when the role has no own area (the /login page goes home). */
  fallbackUrl?: string;
}

/**
 * Mobile-aligned Web Sign-in & Sign-up Form:
 * Features polished inputs, sleek dark theme surface, remembered account banner,
 * clear password toggle, and prompt toast on successful authentication.
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
  const [hasSavedCredentials, setHasSavedCredentials] = useState(() => Boolean(savedEmail()));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
    } catch {}
  }, []);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
  };

  const forgetSaved = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setEmail('');
      setHasSavedCredentials(false);
    } catch {}
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
      setError(res.error || (mode === 'login' ? 'Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu.' : 'Đăng ký thất bại. Vui lòng thử lại sau ít phút.'));
      return;
    }

    // Success feedback
    if (mode === 'register') {
      toast.success(APPLICATION_MESSAGES.MSG04.message);
    } else {
      toast.success('Đăng nhập thành công!', 'Chào mừng bạn quay trở lại với AI Cinema.');
    }

    rememberEmail(email, rememberMe);
    goOn('redirectUrl' in res && typeof res.redirectUrl === 'string' ? res.redirectUrl : undefined);
  };

  const goOn = (redirectUrl?: string) => {
    const target = redirectUrl || fallbackUrl;
    if (target) router.push(target);
  };

  return (
    <>
      <ModeTabs mode={mode} onChange={switchMode} />

      {/* Google Sign-In / Sign-Up Button (Prominently visible for both Login & Register) */}
      <div className="my-4">
        <GoogleSignInButton mode={mode} onSignedIn={goOn} />

        <div className="flex items-center gap-3 my-3 text-[11px] text-slate-400 dark:text-muted uppercase tracking-wider">
          <span className="flex-1 h-px bg-slate-200/80 dark:bg-white/10" />
          <span>{mode === 'login' ? 'hoặc dùng email' : 'hoặc đăng ký bằng email'}</span>
          <span className="flex-1 h-px bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>

      {/* Saved Account Notice (Similar to Mobile AuthModal) */}
      {hasSavedCredentials && mode === 'login' && email && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tài khoản đã lưu: <strong className="font-semibold text-slate-900 dark:text-white">{email}</strong></span>
          </div>
          <button
            type="button"
            onClick={forgetSaved}
            className="text-ruby font-bold hover:underline cursor-pointer ml-2 text-[11px]"
          >
            Quên
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 p-3.5 rounded-2xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2.5 animate-slide-up">
          <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error}</span>
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
                placeholder="Nguyễn Văn A"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="auth-dob" className={LABEL}>
                Ngày sinh <span className="font-normal text-slate-500 text-[11px]">(từ 18 tuổi · Yêu cầu Điều 44)</span>
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
              <p className="text-[11px] text-slate-400 dark:text-muted mt-1">Định dạng theo năm-tháng-ngày.</p>
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
            placeholder="ten@email.com"
            className={INPUT}
          />
        </div>

        <PasswordField
          id="auth-password"
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'login' ? '••••••••' : `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự, có chữ và số`}
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

          {mode === 'login' && (
            <span className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Quên mật khẩu?
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-ruby to-[#B90910] hover:shadow-xl hover:shadow-ruby/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-ruby/20 cursor-pointer text-sm tracking-wide"
        >
          {loading ? 'Đang xác thực…' : mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </button>
      </form>

{/* Switch mode footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 text-center text-xs text-slate-500 dark:text-muted-light">
        {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-ruby font-bold hover:underline cursor-pointer ml-1"
        >
          {mode === 'login' ? 'Tạo tài khoản mới' : 'Đăng nhập ngay'}
        </button>
      </div>
    </>
  );
}
