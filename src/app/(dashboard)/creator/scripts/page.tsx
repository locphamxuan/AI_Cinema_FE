'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Search,
  Download,
  ExternalLink,
  Layers,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface ScriptLibraryItem {
  id: string;
  projectTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  scenesCount: number;
  pagesCount: number;
  acts: string[];
  status: 'APPROVED' | 'IN_REVIEW' | 'DRAFT';
  version: string;
  lastEdited: string;
  logline: string;
}

const SCRIPTS_DATA: ScriptLibraryItem[] = [
  {
    id: 'script-cyber-ep1',
    projectTitle: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
    episodeNumber: 1,
    episodeTitle: 'Bóng Đêm Neon',
    scenesCount: 24,
    pagesCount: 38,
    acts: ['Hồi 1: Tỉnh thức', 'Hồi 2: Thâm nhập chợ đen', 'Hồi 3: Cú bẫy AI'],
    status: 'APPROVED',
    version: 'v3.2 Final Draft',
    lastEdited: '02/11/2026',
    logline: 'Điều tra viên Quân tiếp cận khu chợ đen Tân Định để tìm kiếm lõi lượng tử bị đánh cắp.',
  },
  {
    id: 'script-cyber-ep2',
    projectTitle: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
    episodeNumber: 2,
    episodeTitle: 'Tín Hiệu Lạc',
    scenesCount: 19,
    pagesCount: 32,
    acts: ['Hồi 1: Truy vết mã nguồn', 'Hồi 2: Cuộc chạm trán trên cầu Thủ Thiêm', 'Hồi 3: Rạn nứt'],
    status: 'APPROVED',
    version: 'v2.8 Final',
    lastEdited: '29/10/2026',
    logline: 'Băng đảng người máy phát hiện ra danh tính gián điệp, mở màn cuộc săn lùng xuyên đêm.',
  },
  {
    id: 'script-neo-hanoi-ep3',
    projectTitle: 'Mạng Lưới Sinh Học: Neo Hanoi',
    episodeNumber: 3,
    episodeTitle: 'Xung Đột Huyết Thống',
    scenesCount: 22,
    pagesCount: 35,
    acts: ['Hồi 1: Phòng thí nghiệm ngầm', 'Hồi 2: Sự thật về dự án gen', 'Hồi 3: Đào tẩu'],
    status: 'IN_REVIEW',
    version: 'v1.4 Thẩm định',
    lastEdited: '04/11/2026',
    logline: 'Bác sĩ Lan phát hiện cơ thể cô đã bị can thiệp biến đổi sinh học từ thuở thiếu thời.',
  },
  {
    id: 'script-mars-ep1',
    projectTitle: 'Tàn Tích Sao Hỏa',
    episodeNumber: 1,
    episodeTitle: 'Hạ Cánh Bụi Đỏ',
    scenesCount: 16,
    pagesCount: 28,
    acts: ['Hồi 1: Cơn bão cát', 'Hồi 2: Phát hiện lăng mộ cổ', 'Hồi 3: Tín hiệu SOS'],
    status: 'DRAFT',
    version: 'v0.9 Bản thảo',
    lastEdited: '05/11/2026',
    logline: 'Tàu thám hiểm Ares-7 gặp nạn tại hẻm núi Valles Marineris và phát hiện di tích ngoài hành tinh.',
  },
  {
    id: 'script-atlantica-ep1',
    projectTitle: 'Thành Phố Dưới Đáy Biển: Atlantica',
    episodeNumber: 1,
    episodeTitle: 'Vực Sâu Ánh Sáng',
    scenesCount: 26,
    pagesCount: 42,
    acts: ['Hồi 1: Áp suất cực hạn', 'Hồi 2: Hội đồng vòm kính', 'Hồi 3: Vết nứt đại dương'],
    status: 'APPROVED',
    version: 'v2.1 Final',
    lastEdited: '25/10/2026',
    logline: 'Thủy thủ đoàn tàu ngầm hạt nhân tiếp cận ranh giới vòm kính bảo hộ thành phố ngầm Atlantica.',
  },
];

export default function ScreenplayLibraryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'IN_REVIEW' | 'DRAFT'>('ALL');

  const filtered = SCRIPTS_DATA.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.projectTitle.toLowerCase().includes(q) ||
        item.episodeTitle.toLowerCase().includes(q) ||
        item.logline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = (title: string, version: string) => {
    toast.success(
      'Xuất kịch bản phân cảnh',
      `Đang tải xuống tệp PDF & Final Draft (.fdx) cho "${title}" (${version}).`
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Greeting Card */}
        <header className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-400/20 text-amber-800 dark:text-amber-300 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Thư Viện Kịch Bản Phân Cảnh Chuẩn OTT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Thư Viện Kịch Bản Phân Cảnh
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Lưu trữ, tra cứu toàn bộ hồ sơ kịch bản, lời thoại, act breakdown và nhật ký phiên bản của từng tập phim.
            </p>
          </div>

          <Link
            href="/creator/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <span>Quay lại Dự Án</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'Tất cả kịch bản' },
              { key: 'APPROVED', label: 'Đã thông qua' },
              { key: 'IN_REVIEW', label: 'Đang thẩm định' },
              { key: 'DRAFT', label: 'Bản thảo' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filter === tab.key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold'
                    : 'bg-white dark:bg-[#141724] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên phim, tập, logline..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Grid of Scripts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const isApproved = item.status === 'APPROVED';
            const isInReview = item.status === 'IN_REVIEW';

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 shadow-xs hover:shadow-md transition-all space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.projectTitle}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                      Tập {item.episodeNumber}: {item.episodeTitle}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        : isInReview
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isApproved ? 'ĐÃ DUYỆT FINAL' : isInReview ? 'CHỜ THẨM ĐỊNH' : 'BẢN NHÁP'}
                  </span>
                </div>

                {/* Logline */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.03] p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                  {item.logline}
                </p>

                {/* Meta stats */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Phân Cảnh</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{item.scenesCount} Scenes</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Độ Dài Trang</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{item.pagesCount} Trang</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Phiên Bản</p>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono truncate">{item.version}</p>
                  </div>
                </div>

                {/* Acts Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Cấu trúc Hồi & Phân đoạn kịch bản:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.acts.map((act) => (
                      <span
                        key={act}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Cập nhật: {item.lastEdited}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExport(item.episodeTitle, item.version)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Xuất PDF</span>
                    </button>
                    <Link
                      href="/creator/projects"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>Biên Soạn</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
