'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

type FooterLink = { href: string; label: string };

const WATCH_LINKS: FooterLink[] = [
  { href: '/', label: 'Khám phá' },
  { href: '/phim', label: 'Lọc phim' },
  { href: '/phim?loai=bo', label: 'Phim bộ' },
  { href: '/phim?loai=le', label: 'Phim lẻ' },
];
const GUEST_LINKS: FooterLink[] = [
  { href: '/login', label: 'Đăng nhập' },
  { href: '/login?mode=register', label: 'Đăng ký' },
];
const MEMBER_LINKS: FooterLink[] = [
  { href: '/profile', label: 'Hồ sơ cá nhân' },
  { href: '/profile/history', label: 'Lịch sử xem' },
];

/** Footer of the viewer pages: only links to pages that exist. */
export default function CinemaEnterpriseFooter() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const columns = [
    { title: 'Xem phim', links: WATCH_LINKS },
    { title: 'Tài khoản', links: isAuthenticated ? MEMBER_LINKS : GUEST_LINKS },
  ];
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07090E] text-slate-400 text-xs">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 md:px-14 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E50914] to-red-800 flex items-center justify-center text-white font-black text-sm">
                AI
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                CINEMA<span className="text-[#8B5CF6]">.</span>
              </span>
            </Link>
            <p className="leading-relaxed max-w-md">
              Nền tảng xem phim do AI tạo, sản xuất cùng các studio đối tác. Dành cho người xem từ 18 tuổi.
            </p>
            <p className="flex items-start gap-2 max-w-md text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mỗi tập phim được kiểm duyệt và gắn nhãn nội dung AI theo Điều 44 Luật AI trước khi phát hành.</span>
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 pt-6 border-t border-white/5 text-[11px]">© 2026 AI Cinema. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
