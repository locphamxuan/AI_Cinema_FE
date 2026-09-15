'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import {
  Film,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  Clapperboard,
  Tv
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState('creator@gmail.com');
  const [password, setPassword] = useState('1');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('1');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const res = login(email, password);
    if (res.success) {
      if (res.redirectUrl) {
        router.push(res.redirectUrl);
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 sm:px-6 relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#161922] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E50914] via-[#8B5CF6] to-[#10B981]" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#8B5CF6] p-0.5 mb-3 shadow-lg shadow-[#E50914]/25">
            <div className="w-full h-full bg-[#0B0C10] rounded-[14px] flex items-center justify-center text-white">
              <Clapperboard className="w-7 h-7 text-[#E50914]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Đăng Nhập AI Cinema</h1>
          <p className="text-xs text-gray-400 mt-1">
            Hệ thống phân quyền tự động theo vai trò <span className="text-[#8B5CF6] font-semibold">Maker - Checker</span>
          </p>
        </div>

        {/* Quick Role Selection Box */}
        <div className="mb-5 bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" /> Chọn tài khoản mẫu (MK: 1):
            </span>
            <span className="text-[10px] text-gray-400 font-mono">1-Click Login</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Creator Card */}
            <button
              type="button"
              onClick={() => handleSelectPreset('creator@gmail.com')}
              className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                email.toLowerCase() === 'creator@gmail.com'
                  ? 'bg-[#E50914]/15 border-[#E50914] text-white shadow-md shadow-[#E50914]/10'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Film className="w-3.5 h-3.5 text-[#E50914]" />
                  Creator
                </div>
                {email.toLowerCase() === 'creator@gmail.com' && (
                  <Check className="w-3.5 h-3.5 text-[#E50914]" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-mono truncate">creator@gmail.com</div>
              <span className="text-[9px] text-[#E50914] font-medium mt-0.5">➔ Vào Studio Maker</span>
            </button>

            {/* Reviewer Card */}
            <button
              type="button"
              onClick={() => handleSelectPreset('reviewer@gmail.com')}
              className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                email.toLowerCase() === 'reviewer@gmail.com'
                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/10'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Reviewer
                </div>
                {email.toLowerCase() === 'reviewer@gmail.com' && (
                  <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-mono truncate">reviewer@gmail.com</div>
              <span className="text-[9px] text-[#8B5CF6] font-medium mt-0.5">➔ Vào Thẩm định Checker</span>
            </button>
          </div>

          {/* Regular User demo option */}
          <button
            type="button"
            onClick={() => handleSelectPreset('userdemo@gmail.com')}
            className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              email.toLowerCase() === 'userdemo@gmail.com'
                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white">Khán giả VIP (Demo)</span>
                <span className="text-[10px] text-gray-400 ml-2 font-mono">userdemo@gmail.com</span>
              </div>
            </div>
            <span className="text-[9px] text-emerald-400 font-medium">➔ Xem phim OTT</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email đăng nhập
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition font-medium"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#E50914] cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <span className="text-[11px] text-gray-400">
              Mật khẩu mẫu: <strong className="text-white font-mono">1</strong>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#E50914] to-[#c70811] hover:shadow-xl hover:shadow-[#E50914]/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang chuyển hướng theo vai trò...
              </>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t border-white/10 pt-4">
          <span>Quay lại </span>
          <Link href="/" className="text-[#E50914] font-bold hover:underline">
            Trang chủ OTT Cinema
          </Link>
        </div>
      </div>
    </div>
  );
}
