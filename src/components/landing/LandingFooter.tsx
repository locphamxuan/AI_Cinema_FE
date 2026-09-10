'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function LandingFooter() {
  const { openAuthModal } = useAppStore();
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer className="relative z-20 w-full border-t border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-900/95 backdrop-blur-lg pt-12 pb-16 px-4 sm:px-6 md:px-12 text-slate-600 dark:text-[#808080] text-xs">
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

        {/* Modern Custom Language Selector Dropdown */}
        <div className="mb-6 relative inline-block text-left" ref={langRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-slate-400 dark:hover:border-white/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ruby/30"
            aria-haspopup="listbox"
            aria-expanded={isLangOpen}
          >
            <span className="text-sm">🌐</span>
            <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
            <svg
              className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                isLangOpen ? 'rotate-180 text-ruby' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Floating Dropdown Menu */}
          {isLangOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/15 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-2xl z-50 animate-scale-in">
              <button
                type="button"
                onClick={() => {
                  setLanguage('vi');
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  language === 'vi'
                    ? 'bg-ruby/10 text-ruby font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇻🇳</span>
                  <span>Tiếng Việt</span>
                </div>
                {language === 'vi' && (
                  <svg className="w-3.5 h-3.5 text-ruby" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-ruby/10 text-ruby font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </div>
                {language === 'en' && (
                  <svg className="w-3.5 h-3.5 text-ruby" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          )}
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
