'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

const STORAGE_KEY = 'aicinema_saved_credentials';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    initialAuthEmail,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved credentials or default demo pre-fill on mount / open
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);

      // Check localStorage for saved credentials
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email && parsed.password) {
            setEmail(parsed.email);
            setPassword(parsed.password);
            setRememberMe(true);
            return;
          }
        }
      } catch {}

      // Default pre-fill if initialAuthEmail provided or default demo
      if (initialAuthEmail) {
        setEmail(initialAuthEmail);
      } else {
        setEmail('userdemo@gmail.com');
        setPassword('1');
        setRememberMe(true);
      }
    }
  }, [isAuthModalOpen, authModalMode, initialAuthEmail]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success) {
        // Save or clear credentials in localStorage
        try {
          if (rememberMe) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ email: email.trim(), password: password })
            );
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {}
      } else {
        setError(res.error || 'Đăng nhập thất bại');
      }
    } else {
      const res = register(name, email, password);
      if (res.success) {
        try {
          if (rememberMe) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ email: email.trim(), password: password })
            );
          }
        } catch {}
      } else {
        setError(res.error || 'Đăng ký thất bại');
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="bg-white dark:bg-[#161922] w-full max-w-md p-6 sm:p-8 animate-scale-in border border-slate-200 dark:border-white/15 rounded-3xl relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-muted-light dark:hover:text-foreground transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ruby via-ruby-dark to-slate-950 border border-ruby/40 mb-3 shadow-xl shadow-ruby/25 ring-4 ring-ruby/10">
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-sm font-black text-white tracking-wider">AI</span>
              <span className="text-[8px] font-black text-rose-200 tracking-widest uppercase">CINEMA</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            {mode === 'login' ? 'Đăng Nhập AI Cinema' : 'Tạo Tài Khoản Mới'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">
            {mode === 'login'
              ? 'Thưởng thức phim AI đỉnh cao với hệ thống ví tiền tệ kép'
              : 'Đăng ký ngay để nhận 50 Coin Thưởng tân thủ miễn phí'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-100 dark:bg-black/40 rounded-xl p-1 mb-5 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-ruby text-white shadow-md shadow-ruby/30'
                : 'text-slate-600 dark:text-muted-light hover:text-slate-900 dark:hover:text-foreground'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-ruby text-white shadow-md shadow-ruby/30'
                : 'text-slate-600 dark:text-muted-light hover:text-slate-900 dark:hover:text-foreground'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2 animate-bounce-in">
            <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-muted-light mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-muted-light mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-muted-light">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-muted-light hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                    <span>Ẩn</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Hiện</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Nhập mật khẩu...' : 'Tạo mật khẩu...'}
                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all font-medium"
              />
            </div>
          </div>

          {/* Remember Me Checkbox & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-muted-light hover:text-slate-900 dark:hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-ruby focus:ring-ruby accent-ruby cursor-pointer"
              />
              <span>Ghi nhớ thông tin đăng nhập</span>
            </label>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setEmail('userdemo@gmail.com');
                  setPassword('1');
                }}
                className="text-slate-500 dark:text-muted text-[11px] hover:text-ruby hover:underline transition-colors cursor-pointer"
              >
                Khôi phục mặc định
              </button>
            )}
          </div>

          {mode === 'register' && (
            <div className="p-2.5 rounded-lg bg-coin/10 border border-coin/20 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V4a2 2 0 10-4 0v4m4 0V4a2 2 0 114 0v4m-8 0h8m-10 4h12a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2z" />
                </svg>
              </div>
              <p className="text-[11px] text-coin font-medium">
                Đăng ký ngay tặng <strong>+50 Coin Thưởng</strong> vào ví để mở khóa tập phim!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-xl hover:shadow-ruby/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-3 shadow-lg shadow-ruby/20 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : mode === 'login' ? (
              'Đăng Nhập'
            ) : (
              'Tạo Tài Khoản'
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 text-center text-xs text-muted-light">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-ruby font-bold hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-ruby font-bold hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
