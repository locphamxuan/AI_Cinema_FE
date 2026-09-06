'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      if (initialAuthEmail) {
        setEmail(initialAuthEmail);
      }
      setError(null);
    }
  }, [isAuthModalOpen, authModalMode, initialAuthEmail]);

  if (!isAuthModalOpen) return null;

  const handleQuickFill = () => {
    setEmail('userdemo@gmail.com');
    setPassword('1');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate light network delay
    await new Promise((r) => setTimeout(r, 400));

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Đăng nhập thất bại');
      }
    } else {
      const res = register(name, email, password);
      if (!res.success) {
        setError(res.error || 'Đăng ký thất bại');
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="glass-card w-full max-w-md p-6 sm:p-8 animate-scale-in border border-white/15 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-muted-light hover:text-foreground transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ruby/10 border border-ruby/30 mb-3 text-2xl">
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

        {/* Quick Demo Fill Helper */}
        {mode === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-neon/15 border border-neon/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neon flex items-center gap-1.5">
                ⚡ Tài khoản Mock Test:
              </p>
              <p className="text-[11px] text-foreground/80 mt-0.5 font-mono">
                userdemo@gmail.com | MK: 1
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1.5 rounded-lg bg-neon text-white text-xs font-semibold hover:bg-neon-dark active:scale-95 transition-all shadow-sm shadow-neon/20"
            >
              Điền nhanh
            </button>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-ruby text-white shadow-md'
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-ruby text-white shadow-md'
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
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-light mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Nhập mật khẩu (demo: 1)' : 'Tạo mật khẩu...'}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition-all"
            />
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
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
                className="text-ruby font-bold hover:underline"
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
                className="text-ruby font-bold hover:underline"
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
