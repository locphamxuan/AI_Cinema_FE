'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { latestAdultBirthDate } from '@/lib/registration';
import { PasswordField } from './AuthFields';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const NEEDS_BIRTHDAY = 'GOOGLE_SIGNUP_NEEDS_BIRTHDAY';
const NEEDS_PASSWORD = 'GOOGLE_LINK_NEEDS_PASSWORD';
type Step = typeof NEEDS_BIRTHDAY | typeof NEEDS_PASSWORD;

interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let gisLoading: Promise<void> | null = null;

/** Loads Google Identity Services once per page. */
function loadGis(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  gisLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoading = null;
      reject(new Error('Google Identity Services failed to load'));
    };
    document.head.appendChild(script);
  });
  return gisLoading;
}

const INPUT =
  'w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all';

/**
 * "Sign in with Google" / "Sign up with Google".
 * A first sign-in may need one more answer: a birthday to open a member account (18+, BR-54),
 * or the password of the account that already owns the email.
 * The same Google token is sent again with that answer.
 */
export default function GoogleSignInButton({
  onSignedIn,
  mode = 'login',
}: {
  onSignedIn: (redirectUrl?: string) => void;
  mode?: 'login' | 'register';
}) {
  // Use client ID from env, or fall back to the project's official Google Web client ID unless explicitly blanked out in unit tests
  const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientId = envClientId !== undefined ? envClientId : '440650077495-fjea3pvoj35lt770sqp6ile9ib8ufafp.apps.googleusercontent.com';

  const loginWithGoogle = useAppStore((state) => state.loginWithGoogle);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (token: string, extra?: { dateOfBirth?: string; password?: string }) => {
    setLoading(true);
    setError(null);
    const res = await loginWithGoogle(token, extra);
    setLoading(false);
    if (res.success) {
      onSignedIn(res.redirectUrl);
      return;
    }
    if (res.reason === NEEDS_BIRTHDAY || res.reason === NEEDS_PASSWORD) {
      setIdToken(token);
      setStep(res.reason);
      return;
    }
    setError(res.error ?? 'Đăng nhập bằng Google thất bại.');
  };

  // The callback keeps the latest signIn without re-rendering Google's button.
  const signInRef = useRef(signIn);
  useEffect(() => {
    signInRef.current = signIn;
  });

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        const host = buttonRef.current;
        if (cancelled || !host || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => void signInRef.current(credential),
        });
        window.google.accounts.id.renderButton(host, {
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          width: Math.min(host.offsetWidth || 340, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được đăng nhập Google. Hãy kiểm tra kết nối mạng.');
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, mode]);

  if (!clientId) return null;

  const answer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) return;
    if (step === NEEDS_BIRTHDAY) {
      if (!dateOfBirth) return setError('Vui lòng nhập ngày sinh.');
      void signIn(idToken, { dateOfBirth });
    } else if (step === NEEDS_PASSWORD) {
      if (!password) return setError('Vui lòng nhập mật khẩu.');
      void signIn(idToken, { password });
    }
  };

  return (
    <div className="w-full">
      {step ? (
        <form onSubmit={answer} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10" aria-label="Hoàn tất đăng nhập Google">
          <p className="text-xs text-slate-600 dark:text-muted-light">
            {step === NEEDS_BIRTHDAY
              ? 'Lần đầu đăng nhập bằng Google: nhập ngày sinh để tạo tài khoản (từ 18 tuổi).'
              : 'Email này đã có tài khoản AI Cinema. Nhập mật khẩu của tài khoản đó để liên kết với Google.'}
          </p>
          {step === NEEDS_BIRTHDAY ? (
            <div>
              <label htmlFor="google-dob" className="block text-xs font-semibold text-slate-700 dark:text-muted-light mb-1">
                Ngày sinh
              </label>
              <input
                id="google-dob"
                type="date"
                required
                autoComplete="bday"
                max={latestAdultBirthDate()}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`${INPUT} dark:[color-scheme:dark]`}
              />
            </div>
          ) : (
            <PasswordField
              id="google-password"
              label="Mật khẩu tài khoản"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu..."
            />
          )}
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep(null);
                setIdToken(null);
                setError(null);
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/15 text-slate-600 dark:text-muted-light hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {error && (
            <p role="alert" className="mb-2 text-center text-xs text-danger">
              {error}
            </p>
          )}
          {/* Official Google Button container with graceful styled placeholder while GIS iframe loads */}
          <div
            ref={buttonRef}
            className="flex justify-center min-h-[44px] w-full"
            data-testid="google-signin"
          >
            <button
              type="button"
              className="w-full max-w-[340px] flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1A202C] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'register' ? 'Đăng ký bằng Google' : 'Đăng nhập bằng Google'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
