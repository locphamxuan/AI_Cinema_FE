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
 * "Sign in with Google". A first sign-in may need one more answer from the viewer: a birthday to
 * open a member account (18+, BR-54), or the password of the account that already owns the email.
 * The same Google token is sent again with that answer.
 */
export default function GoogleSignInButton({ onSignedIn }: { onSignedIn: (redirectUrl?: string) => void }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
          text: 'continue_with',
          shape: 'pill',
          width: Math.min(host.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được đăng nhập Google. Hãy kiểm tra kết nối mạng.');
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

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
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-400 dark:text-muted uppercase tracking-wide">
        <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        hoặc
        <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
      </div>

      {step ? (
        <form onSubmit={answer} className="space-y-3" aria-label="Hoàn tất đăng nhập Google">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep(null);
                setIdToken(null);
                setError(null);
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/15 text-slate-600 dark:text-muted-light cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-ruby disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </div>
        </form>
      ) : (
        error && (
          <p role="alert" className="mb-2 text-center text-xs text-danger">
            {error}
          </p>
        )
      )}
      {/* Stays mounted while a step is open, so Google's button is still there after "Hủy". */}
      <div ref={buttonRef} className={step ? 'hidden' : 'flex justify-center min-h-[44px]'} data-testid="google-signin" />
    </div>
  );
}
