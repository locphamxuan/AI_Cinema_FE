'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function LandingFooter() {
  const { openAuthModal } = useAppStore();
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  return (
    <footer className="relative z-20 w-full border-t border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-[#0B0C10]/95 backdrop-blur-lg pt-12 pb-16 px-4 sm:px-6 md:px-12 text-slate-600 dark:text-[#808080] text-xs">
      <div className="max-w-6xl mx-auto">
        {/* Contact Hotline / Inquiry */}
        <p className="mb-8 text-sm text-slate-600 dark:text-[#808080]">
          Có thắc mắc?{' '}
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal('login');
            }}
            className="hover:underline text-slate-900 dark:text-foreground font-semibold"
          >
            Hãy liên hệ với chúng tôi qua Trợ lý AI hoặc Hotline 1800-8888 (Miễn phí)
          </a>
        </p>

        {/* 4 Columns Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3.5 gap-x-6 mb-8 text-[12px]">
          {/* Column 1 */}
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Câu hỏi thường gặp
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Quan hệ nhà đầu tư
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Quyền riêng tư & Bảo mật AI
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Kiểm tra tốc độ HLS
              </button>
            </li>
          </ul>

          {/* Column 2 */}
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Trung tâm trợ giúp
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Cơ hội việc làm Studio AI
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Tùy chọn Cookie
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Thông báo pháp lý (Điều 44 Luật AI)
              </button>
            </li>
          </ul>

          {/* Column 3 */}
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Tài khoản & Ví tiền tệ kép
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Các cách xem trên thiết bị
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Thông tin đồ án tốt nghiệp
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Chỉ có trên AI Cinema
              </button>
            </li>
          </ul>

          {/* Column 4 */}
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Trung tâm truyền thông
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Điều khoản sử dụng
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Liên hệ với chúng tôi
              </button>
            </li>
            <li>
              <button
                onClick={() => openAuthModal('login')}
                className="hover:underline text-left text-slate-600 dark:text-[#808080] hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer"
              >
                Chứng chỉ kiểm duyệt Nghị định 142
              </button>
            </li>
          </ul>
        </div>

        {/* Language Selector Dropdown */}
        <div className="mb-6">
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
              className="appearance-none bg-white dark:bg-black/80 border border-slate-300 dark:border-white/25 rounded-md px-8 py-2 text-slate-800 dark:text-foreground text-xs outline-none focus:border-slate-500 dark:focus:border-white cursor-pointer pr-10 shadow-sm"
            >
              <option value="vi">🌐 Tiếng Việt</option>
              <option value="en">🌐 English</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-600 dark:text-white text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Brand Copyright */}
        <p className="text-[13px] text-slate-700 dark:text-[#808080] mb-2 font-bold">
          AI Cinema Việt Nam
        </p>

        {/* reCAPTCHA / Legal text */}
        <p className="text-[10px] text-slate-500 dark:text-[#555555] leading-relaxed">
          Trang web này được xây dựng cho Đồ án Tốt nghiệp &quot;AI Cinema - Nền tảng OTT Streaming Phim AI kết hợp Ví tiền tệ kép&quot;. Toàn bộ nội dung số tuân thủ Điều 44 Luật Trí tuệ Nhân tạo 2025 và Nghị định 142/2024/NĐ-CP.
        </p>
      </div>
    </footer>
  );
}
