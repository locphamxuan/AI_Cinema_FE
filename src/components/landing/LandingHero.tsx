'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import LandingFooter from './LandingFooter';

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
  const { openAuthModal } = useAppStore();
  const [emailInput, setEmailInput] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    openAuthModal('register', emailInput);
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
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center flex flex-col items-center">
        {/* Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ruby/15 border border-ruby/30 text-ruby text-xs sm:text-sm font-semibold mb-6 animate-fade-in shadow-lg shadow-ruby/10">
          <span className="w-2 h-2 rounded-full bg-ruby animate-pulse" />
          <span>Nền tảng OTT Streaming Phim AI • Tuân thủ Điều 44 Luật AI & Nghị định 142</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight sm:leading-tight mb-4 max-w-4xl">
          Phim AI, Series & Tác Phẩm Số{' '}
          <span className="gradient-text-ruby">Không Giới Hạn</span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-xl text-foreground/90 font-medium mb-2">
          Mô hình Ví Tiền Tệ Kép (Dual-Wallet) độc quyền. Giá khởi điểm từ 79.000 đ.
        </p>
        <p className="text-xs sm:text-sm text-muted-light mb-8 max-w-2xl">
          Sẵn sàng thưởng thức các siêu phẩm tạo 100% bằng Trí tuệ Nhân tạo? Nhập email để bắt đầu trải nghiệm ngay.
        </p>

        {/* Email Call to Action */}
        <form
          onSubmit={handleGetStarted}
          className="w-full max-w-xl flex flex-col sm:flex-row gap-2 sm:gap-0 mb-16 shadow-2xl rounded-2xl overflow-hidden"
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
            className="px-7 py-3.5 bg-ruby hover:bg-ruby-dark text-white font-bold text-base flex items-center justify-center gap-2 rounded-xl sm:rounded-l-none transition-all active:scale-95 shrink-0 shadow-lg shadow-ruby/30 cursor-pointer"
          >
            <span>Bắt đầu</span>
            <span className="text-xl">›</span>
          </button>
        </form>

        {/* Netflix-Style "Reasons to Join" Bento Grid */}
        <div className="w-full text-left space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Lý Do Nên Chọn AI Cinema
            </h2>
            <p className="text-xs sm:text-sm text-muted-light mt-1">
              Hệ sinh thái OTT thế hệ mới kết hợp trí tuệ nhân tạo và mô hình kinh tế số minh bạch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bento Card 1: 100% AI Movies */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-ruby/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-ruby/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-ruby/10 rounded-full blur-2xl pointer-events-none group-hover:bg-ruby/20 transition-colors" />

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-ruby transition-colors mb-2">
                  Phim AI 4K Độc Quyền
                </h3>
                <p className="text-xs text-muted-light leading-relaxed">
                  Toàn bộ kịch bản, hình ảnh và âm thanh được tạo 100% bởi các mô hình AI tiên tiến (Sora, Runway Gen-3) chuẩn 4K HDR.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] font-mono text-ruby font-bold">CinemaGen v3.2</span>
                <div className="w-9 h-9 rounded-xl bg-ruby/15 border border-ruby/30 flex items-center justify-center text-ruby">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Dual Wallet */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-coin/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-coin/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-coin/10 rounded-full blur-2xl pointer-events-none group-hover:bg-coin/20 transition-colors" />

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-coin transition-colors mb-2">
                  Ví Tiền Tệ Kép
                </h3>
                <p className="text-xs text-muted-light leading-relaxed">
                  Tách biệt Coin Chính và Coin Thưởng từ điểm danh 7 ngày. Thuật toán tự động ưu tiên trừ coin chính trước, coin thưởng bù sau.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] font-mono text-coin font-bold">Dual-Wallet System</span>
                <div className="w-9 h-9 rounded-xl bg-coin/15 border border-coin/30 flex items-center justify-center text-coin">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Law Compliance */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-verified/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-verified/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-verified/10 rounded-full blur-2xl pointer-events-none group-hover:bg-verified/20 transition-colors" />

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-verified transition-colors mb-2">
                  Chuẩn Hóa Luật AI
                </h3>
                <p className="text-xs text-muted-light leading-relaxed">
                  Mỗi tác phẩm đều có nhãn kiểm duyệt số, điểm an toàn nội dung và chứng chỉ tuân thủ Điều 44 Luật AI & Nghị định 142.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] font-mono text-verified font-bold">Điều 44 Approved</span>
                <div className="w-9 h-9 rounded-xl bg-verified/15 border border-verified/30 flex items-center justify-center text-verified">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Multi-device & Auto-Renew */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-neon/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-neon/10 rounded-full blur-2xl pointer-events-none group-hover:bg-neon/20 transition-colors" />

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-neon transition-colors mb-2">
                  Hội Viên & Cảnh Báo 24h
                </h3>
                <p className="text-xs text-muted-light leading-relaxed">
                  Xem không giới hạn trên mọi thiết bị. Hệ thống tự động kích hoạt banner đếm ngược 24h trước khi gia hạn, không phí ẩn.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] font-mono text-neon font-bold">24h Alert Guard</span>
                <div className="w-9 h-9 rounded-xl bg-neon/15 border border-neon/30 flex items-center justify-center text-neon">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style Footer */}
      <LandingFooter />
    </div>
  );
}
