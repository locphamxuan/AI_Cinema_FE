'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

const mockBackdropPosters = [
  'https://picsum.photos/seed/aicinema1/300/450',
  'https://picsum.photos/seed/aicinema2/300/450',
  'https://picsum.photos/seed/aicinema3/300/450',
  'https://picsum.photos/seed/aicinema4/300/450',
  'https://picsum.photos/seed/aicinema5/300/450',
  'https://picsum.photos/seed/aicinema6/300/450',
  'https://picsum.photos/seed/aicinema7/300/450',
  'https://picsum.photos/seed/aicinema8/300/450',
  'https://picsum.photos/seed/aicinema9/300/450',
  'https://picsum.photos/seed/aicinema10/300/450',
  'https://picsum.photos/seed/aicinema11/300/450',
  'https://picsum.photos/seed/aicinema12/300/450',
];

export default function LandingHero() {
  const { openAuthModal, login } = useAppStore();
  const [emailInput, setEmailInput] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    openAuthModal('register', emailInput);
  };

  const handleQuickDemoLogin = () => {
    login('userdemo@gmail.com', '1');
  };

  return (
    <div className="relative -mt-6 -mx-4 sm:-mx-6 overflow-hidden">
      {/* Background Poster Grid with Vignette */}
      <div className="absolute inset-0 z-0 opacity-25 scale-105 pointer-events-none">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 transform -rotate-6 translate-y-[-10%] translate-x-[-5%] filter blur-[1px]">
          {mockBackdropPosters.concat(mockBackdropPosters).map((url, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <img src={url} alt="Movie poster" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Radial and Linear Dark Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-[#0B0C10]/60" />
      <div className="absolute inset-0 z-10 bg-radial from-transparent via-[#0B0C10]/60 to-[#0B0C10]" />

      {/* Main Content Hero */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-28 text-center flex flex-col items-center">
        {/* Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ruby/15 border border-ruby/30 text-ruby text-xs sm:text-sm font-semibold mb-6 animate-fade-in shadow-lg shadow-ruby/10">
          <span>🏷️</span>
          <span>Nền tảng OTT Streaming Phim AI • Tuân thủ Điều 44 Luật AI & Nghị định 142</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight sm:leading-tight mb-4 max-w-4xl">
          Phim AI, Series & Tác Phẩm Số{' '}
          <span className="gradient-text-ruby">Không Giới Hạn</span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-xl text-foreground/90 font-medium mb-3">
          Mô hình Ví Tiền Tệ Kép (Dual-Wallet) độc quyền. Giá khởi điểm từ 79.000 đ.
        </p>
        <p className="text-xs sm:text-sm text-muted-light mb-8 max-w-2xl">
          Sẵn sàng thưởng thức các siêu phẩm tạo 100% bằng Trí tuệ Nhân tạo? Nhập email để bắt đầu hoặc đăng nhập trải nghiệm ngay.
        </p>

        {/* Email Call to Action */}
        <form
          onSubmit={handleGetStarted}
          className="w-full max-w-xl flex flex-col sm:flex-row gap-2 sm:gap-0 mb-6 shadow-2xl rounded-2xl overflow-hidden"
        >
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn..."
            className="flex-1 bg-black/70 border border-white/20 sm:border-r-0 rounded-xl sm:rounded-r-none px-5 py-3.5 text-sm sm:text-base text-foreground placeholder-muted outline-none focus:ring-2 focus:ring-ruby backdrop-blur-md transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-ruby hover:bg-ruby-dark text-white font-bold text-base flex items-center justify-center gap-2 rounded-xl sm:rounded-l-none transition-all active:scale-95 shrink-0 shadow-lg shadow-ruby/30"
          >
            <span>Bắt đầu</span>
            <span className="text-xl">›</span>
          </button>
        </form>

        {/* Fast Test Action with Mock Account */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
          <button
            onClick={handleQuickDemoLogin}
            className="px-5 py-2.5 rounded-xl bg-neon/20 border border-neon/40 text-neon hover:bg-neon/30 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-neon/20"
          >
            <span>⚡ Đăng nhập nhanh Mock (userdemo@gmail.com / 1)</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2.5 rounded-xl glass-card-sm text-foreground/90 hover:text-foreground text-xs sm:text-sm font-medium transition-all"
          >
            Đăng nhập tài khoản khác
          </button>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full text-left">
          <div className="glass-card p-5 border border-white/10 hover:border-coin/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-coin/20 border border-coin/30 flex items-center justify-center text-xl mb-3">
              🟡
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Ví Tiền Tệ Kép</h3>
            <p className="text-xs text-muted-light leading-relaxed">
              Tách biệt Coin Chính (nạp tiền) & Coin Thưởng (điểm danh streak 7 ngày). Thuật toán khấu trừ thông minh ưu tiên tối đa.
            </p>
          </div>

          <div className="glass-card p-5 border border-white/10 hover:border-ruby/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-ruby/20 border border-ruby/30 flex items-center justify-center text-xl mb-3">
              🎬
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Phim AI & Streaming HLS</h3>
            <p className="text-xs text-muted-light leading-relaxed">
              Trình phát HLS mượt mà, trailer preview 30s, kèm nhãn tuân thủ AI có chứng chỉ kiểm duyệt trực tiếp dưới màn hình.
            </p>
          </div>

          <div className="glass-card p-5 border border-white/10 hover:border-neon/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neon/20 border border-neon/30 flex items-center justify-center text-xl mb-3">
              👑
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Hội Viên & Cảnh Báo 24h</h3>
            <p className="text-xs text-muted-light leading-relaxed">
              Gói VIP xem thả ga. Hệ thống tự động kích hoạt banner đếm ngược 24h trước khi gia hạn nhằm bảo vệ quyền lợi người dùng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
