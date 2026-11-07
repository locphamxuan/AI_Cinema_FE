'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
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
    <div className="min-h-screen w-full bg-[#090B10] text-slate-100 px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/10 text-slate-300 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Thư Viện Kịch Bản Phân Cảnh Chuẩn OTT</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Thư Viện Kịch Bản Phân Cảnh
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Lưu trữ, tra cứu toàn bộ hồ sơ kịch bản, lời thoại, act breakdown và nhật ký phiên bản của từng tập phim.
          </p>
        </div>

        <Link
          href="/creator/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <span>Xem Danh Sách Dự Án</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111420] border border-white/[0.08] overflow-x-auto">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#E50914] text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên phim, tập, logline..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
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
              className="rounded-2xl bg-[#111420] border border-white/[0.08] p-6 shadow-xl hover:border-white/20 transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.projectTitle}
                  </p>
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">
                    Tập {item.episodeNumber}: {item.episodeTitle}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                    isApproved
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isInReview
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isApproved ? 'ĐÃ DUYỆT FINAL' : isInReview ? 'CHỜ THẨM ĐỊNH' : 'BẢN NHÁP'}
                </span>
              </div>

              {/* Logline */}
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                {item.logline}
              </p>

              {/* Meta stats */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-slate-400">Phân Cảnh</p>
                  <p className="text-sm font-bold text-white font-mono">{item.scenesCount} Scenes</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-slate-400">Độ Dài Trang</p>
                  <p className="text-sm font-bold text-white font-mono">{item.pagesCount} Trang</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-slate-400">Phiên Bản</p>
                  <p className="text-xs font-bold text-red-400 font-mono truncate">{item.version}</p>
                </div>
              </div>

              {/* Acts Breakdown */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E50914]" />
                  Cấu trúc Hồi & Phân đoạn kịch bản:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.acts.map((act) => (
                    <span
                      key={act}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Cập nhật: {item.lastEdited}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExport(item.episodeTitle, item.version)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Xuất PDF</span>
                  </button>
                  <Link
                    href={`/creator/projects`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-[#E50914] text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Mở Biên Soạn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
