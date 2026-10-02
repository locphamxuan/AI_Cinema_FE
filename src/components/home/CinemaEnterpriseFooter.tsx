'use client';

import Link from 'next/link';
import { Film, ShieldCheck } from 'lucide-react';

export default function CinemaEnterpriseFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07090E] text-slate-400 text-xs selection:bg-red-600 selection:text-white">
      {/* Top Banner Info */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 md:px-14 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E50914] to-red-800 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/30">
                AI
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                CINEMA<span className="text-[#8B5CF6]">.</span>
              </span>
            </Link>

            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              Hệ thống quản lý, thẩm định tuân thủ pháp lý và phát hành trực tuyến phim Trí tuệ Nhân tạo (B2B2C OTT Platform).
              Đồng hành cùng các Third-party AI Studios tại Việt Nam và quốc tế thương mại hóa nội dung số chính ngạch.
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1 max-w-md">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Tuân thủ Điều 44 Luật AI & NĐ 142/2026/NĐ-CP</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Mọi tác phẩm trên nền tảng được kiểm duyệt bản quyền, gắn nhãn nhận diện tạo sinh và kiểm tra an toàn trước khi lên sóng.
              </p>
            </div>
          </div>

          {/* Column 1: Khám Phá Nội Dung */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khám Phá Phim</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition">Top 10 Phim AI Hôm Nay</Link></li>
              <li><Link href="/" className="hover:text-white transition">Series AI Cyberpunk 2077</Link></li>
              <li><Link href="/" className="hover:text-white transition">Phim 3D AI Fantasy</Link></li>
              <li><Link href="/" className="hover:text-white transition">Phim Lẻ AI Tuyển Chọn</Link></li>
              <li><Link href="/" className="hover:text-white transition">Bảng Xếp Hạng Đánh Giá Cao</Link></li>
            </ul>
          </div>

          {/* Column 2: Cổng Đối Tác (Maker & Checker) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dành Cho Đối Tác</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/creator" className="text-purple-400 hover:text-purple-300 transition flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" /> Maker Hub (Studio Studio)
                </Link>
              </li>
              <li>
                <Link href="/reviewer" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Checker Hub (Kiểm Duyệt)
                </Link>
              </li>
              <li><Link href="/creator" className="hover:text-white transition">Quy chuẩn nộp HLS Master</Link></li>
              <li><Link href="/creator" className="hover:text-white transition">Chính sách chia sẻ doanh thu 70/30</Link></li>
              <li><Link href="/creator" className="hover:text-white transition">Hướng dẫn khai báo AI Pipeline</Link></li>
            </ul>
          </div>

          {/* Column 3: Hỗ Trợ & Pháp Lý */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hỗ Trợ & Pháp Lý</h4>
            <ul className="space-y-2">
              <li><Link href="/profile/transactions" className="hover:text-white transition">Ví Coin & Lịch sử giao dịch</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Gói hội viên VIP Pass</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Điều khoản bảo mật người dùng</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Chính sách giải quyết tranh chấp</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">Báo cáo vi phạm bản quyền (DMCA)</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 AI Cinema Platform. Nền Tảng Quản Trị Vòng Đời & Phân Phối Phim AI. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            <span>Phiên bản Enterprise v2.4 (App Router)</span>
            <span>·</span>
            <span>Cơ sở dữ liệu Neon PostgreSQL</span>
            <span>·</span>
            <span className="text-emerald-400">Hệ thống Trực tuyến 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
