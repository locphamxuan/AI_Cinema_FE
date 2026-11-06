'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Film,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Clapperboard,
  ShieldCheck,
  Crown,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { latestAdultBirthDate, MIN_PASSWORD_LENGTH, registrationError } from '@/lib/registration';

const STORAGE_KEY = 'aicinema_saved_email';

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

const DEMO_ACCOUNTS = [
  {
    role: 'Creator',
    label: '🎬 Creator',
    subtitle: 'Studio Phim',
    email: 'creator.aicinema@gmail.com',
    password: 'Aicinema@123',
    icon: Clapperboard,
  },
  {
    role: 'Reviewer',
    label: '⚖️ Reviewer',
    subtitle: 'Thẩm Định Phim',
    email: 'reviewer@gmail.com',
    password: 'Aicinema@123',
    icon: ShieldCheck,
  },
  {
    role: 'Staff',
    label: '🛠️ Staff',
    subtitle: 'Vận Hành Sàn',
    email: 'admin@gmail.com',
    password: 'Aicinema@123',
    icon: Users,
  },
  {
    role: 'Admin',
    label: '👑 Admin',
    subtitle: 'Tổng Quản Trị',
    email: 'admin@gmail.com',
    password: 'Aicinema@123',
    icon: Crown,
  },
];

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, register } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState(() => savedEmail() || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'login');
  }, [searchParams]);

  const handleFillDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setActiveDemo(demo.role);
    setError(null);
    setMode('login');
    toast.success(
      `Đã điền tài khoản demo: ${demo.role}`,
      `Email: ${demo.email} • Bấm "Đăng Nhập" để truy cập ngay.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Họ và tên cần ít nhất 2 ký tự.');
        return;
      }
      const problem = registrationError(password, dateOfBirth);
      if (problem) {
        setError(problem);
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp.');
        return;
      }
    }

    setLoading(true);
    const res =
      mode === 'login'
        ? await login(email, password)
        : await register(name, email, password, dateOfBirth);
    setLoading(false);

    if (!res.success) {
      setError(
        res.error ||
          (mode === 'login'
            ? 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
            : 'Đăng ký không thành công. Vui lòng thử lại sau ít phút.')
      );
      return;
    }

    rememberEmail(email, rememberMe);
    toast.success(
      mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!',
      'Chào mừng bạn đến với thế giới điện ảnh AI Cinema.'
    );

    const redirectUrl =
      'redirectUrl' in res && typeof res.redirectUrl === 'string'
        ? res.redirectUrl
        : '/';
    router.push(redirectUrl);
  };

  return (
    <div className="relative max-w-md w-full bg-[#12151E]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/90 text-white z-10 overflow-hidden">
      {/* Top ambient glow beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />

      {/* ── CARD HEADER ── */}
      <div className="space-y-1.5 mb-7">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {mode === 'login'
            ? 'Trải nghiệm rạp chiếu phim AI độc quyền và các tác phẩm điện ảnh số thế hệ mới.'
            : 'Tham gia cộng đồng khán giả khám phá những bộ phim AI đột phá hàng đầu.'}
        </p>
      </div>

      {/* ── GOOGLE SIGN-IN BUTTON ── */}
      <div className="space-y-4 mb-6">
        <GoogleSignInButton
          mode={mode}
          onSignedIn={(url) => router.push(url || '/')}
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative px-3 bg-[#12151E] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {mode === 'login' ? 'Hoặc đăng nhập với Email' : 'Hoặc đăng ký bằng Email'}
          </div>
        </div>
      </div>

      {/* ── ERROR ALERT ── */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ── FORM INPUTS ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-300">
                Họ và tên
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-dob" className="block text-xs font-semibold text-slate-300">
                Ngày sinh <span className="text-[11px] font-normal text-slate-400">(Từ 18 tuổi • Tuân thủ Điều 44)</span>
              </label>
              <input
                id="auth-dob"
                type="date"
                required
                max={latestAdultBirthDate()}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm [color-scheme:dark] outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
              />
            </div>
          </>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-300">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setActiveDemo(null);
            }}
            placeholder="ten@email.com"
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-300">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setActiveDemo(null);
              }}
              placeholder={mode === 'login' ? '••••••••' : `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-slate-500 outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (Register mode only) */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-slate-300">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                id="auth-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-slate-500 outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Checkbox Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[#E50914] cursor-pointer"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          {mode === 'login' && (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Hỗ trợ lấy lại mật khẩu', 'Vui lòng liên hệ Admin qua email contact@aicinema.vn để được hỗ trợ.');
              }}
              className="text-xs text-slate-400 hover:text-[#E50914] transition-colors"
            >
              Quên mật khẩu?
            </Link>
          )}
        </div>

        {/* CTA SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#E50914] to-[#C11119] hover:from-[#B81D24] hover:to-[#9E0D14] shadow-lg shadow-red-950/40 active:scale-[0.99] transition-all text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : mode === 'login' ? (
            'Đăng Nhập'
          ) : (
            'Tạo Tài Khoản Mới'
          )}
        </button>
      </form>

      {/* ── 4. DEMO FAST-LOGIN PILLS FOR EVALUATION / PROPOSAL ── */}
      <div className="mt-7 pt-5 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tài khoản thử nghiệm cho Hội đồng (Demo)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">1-Chạm điền ngay</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((demo) => {
            const isSelected = activeDemo === demo.role;
            return (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleFillDemo(demo)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-red-500/20 border-[#E50914] text-white shadow-sm'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{demo.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. CARD FOOTER ── */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3 text-xs text-slate-400">
        <p>
          {mode === 'login' ? 'Chưa có tài khoản khán giả? ' : 'Đã có tài khoản AI Cinema? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-[#E50914] font-bold hover:underline ml-1 cursor-pointer"
          >
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </p>

        <p className="pt-1 text-[11px] text-slate-400 border-t border-white/5">
          Bạn là Studio sáng tạo nội dung mới?{' '}
          <Link href="/creator" className="text-[#E50914] font-bold hover:underline ml-0.5">
            Đăng ký phân phối phim ➔
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-[#0A0D14]">
      {/* ── CINEMATIC HERO BACKDROP ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 filter blur-[2px] transition-transform duration-1000"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop')",
        }}
        aria-hidden="true"
      />

      {/* Deep gradient overlays */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/80 to-[#0A0D14]/50 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(14, 18, 28, 0.4) 0%, rgba(5, 7, 12, 0.95) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Ambient Glow ánh đỏ Ruby / Tím lan tỏa phía sau card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[650px] h-[550px] sm:h-[650px] bg-gradient-to-tr from-[#E50914]/25 via-[#8B5CF6]/15 to-transparent rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* ── MINIMAL TOP HEADER ── */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-6 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#B91C1C] flex items-center justify-center text-white shadow-lg shadow-red-950/60 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
            AI <span className="text-[#E50914]">CINEMA</span>
          </span>
        </Link>

        {/* Right: Return & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}</span>
          </button>

          {/* Return Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-sm hover:scale-[1.02]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </header>

      {/* ── AUTH CARD WRAPPER ── */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="max-w-md w-full bg-[#12151E]/80 rounded-3xl p-12 text-center text-white border border-white/10">
              <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold">Đang chuẩn bị rạp chiếu AI...</p>
            </div>
          }
        >
          <LoginFormInner />
        </Suspense>
      </main>

      {/* ── SIMPLE BOTTOM COPYRIGHT ── */}
      <footer className="relative z-20 w-full px-6 py-4 text-center text-slate-500 text-xs">
        <p>© 2026 AI Cinema. Bản quyền thuộc về Nền tảng OTT Streaming phim AI Việt Nam.</p>
      </footer>
    </div>
  );
}
