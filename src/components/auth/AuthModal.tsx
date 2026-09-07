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
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="glass-card w-full max-w-md p-6 sm:p-8 animate-scale-in border border-white/15 relative overflow-hidden shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-muted-light hover:text-foreground transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ruby/10 border border-ruby/30 mb-3 text-2xl shadow-lg shadow-ruby/10">
            🎬
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Đăng Nhập AI Cinema' : 'Tạo Tài Khoản Mới'}
          </h2>
          <p className="text-xs text-muted-light mt-1">
            {mode === 'login'
              ? 'Thưởng thức phim AI đỉnh cao với hệ thống ví tiền tệ kép'
              : 'Đăng ký ngay để nhận 50 Coin Thưởng tân thủ miễn phí'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-black/40 rounded-xl p-1 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-ruby text-white shadow-md shadow-ruby/30'
                : 'text-muted-light hover:text-foreground'
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
                : 'text-muted-light hover:text-foreground'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2 animate-bounce-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-light mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-muted-light">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-muted-light hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? '🙈 Ẩn' : '👁️ Hiện'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Nhập mật khẩu...' : 'Tạo mật khẩu...'}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all font-medium"
              />
            </div>
          </div>

          {/* Remember Me Checkbox & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-muted-light hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-ruby focus:ring-ruby accent-ruby cursor-pointer"
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
                className="text-muted text-[11px] hover:text-ruby hover:underline transition-colors cursor-pointer"
              >
                Khôi phục mặc định
              </button>
            )}
          </div>

          {mode === 'register' && (
            <div className="p-2.5 rounded-lg bg-coin/10 border border-coin/20 flex items-center gap-2">
              <span className="text-base">🎁</span>
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
