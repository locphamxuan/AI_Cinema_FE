'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clapperboard,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Building2,
  User,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface QueueItem {
  id: string;
  projectId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  genre: string;
  creatorName: string;
  studioName: string;
  stage: 'SCRIPT_PENDING' | 'MASTER_AUDIT' | 'STUDIO_REVISING' | 'ARTICLE_44_APPROVED';
  stageLabel: string;
  thumbnailUrl: string;
  submittedAt: string;
  promptsCount: number;
  openTicketsCount: number;
}

const MOCK_QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'queue-1',
    projectId: 'proj-cyber-saigon',
    title: 'Cyber Saigon 2077: Mạng Lưới Ngầm',
    episodeNumber: 2,
    totalEpisodes: 8,
    genre: 'Sci-Fi / Cyberpunk',
    creatorName: 'Lê Minh Tuấn (In-house Screenwriter)',
    studioName: 'Saigon VFX Lab',
    stage: 'MASTER_AUDIT',
    stageLabel: 'Bản Dựng Master 4K Sẵn Sàng',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Hôm nay, 10:15',
    promptsCount: 142,
    openTicketsCount: 3,
  },
  {
    id: 'queue-2',
    projectId: 'proj-neo-hanoi',
    title: 'Mạng Lưới Sinh Học: Neo Hanoi 2085',
    episodeNumber: 1,
    totalEpisodes: 6,
    genre: 'Bio-Thriller / AI',
    creatorName: 'Trần Quỳnh Nga (In-house Screenwriter)',
    studioName: 'Ares Animation Studio',
    stage: 'SCRIPT_PENDING',
    stageLabel: 'Kịch Bản Chờ Thẩm Định',
    thumbnailUrl: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Hôm qua, 16:40',
    promptsCount: 96,
    openTicketsCount: 0,
  },
  {
    id: 'queue-3',
    projectId: 'proj-dark-zone',
    title: 'Hồ Sơ Hắc Ám: Vụ Án Khu 9',
    episodeNumber: 3,
    totalEpisodes: 5,
    genre: 'Mystery / Detective AI',
    creatorName: 'Nguyễn Văn Nam (In-house Screenwriter)',
    studioName: 'Red River CGI Studio',
    stage: 'STUDIO_REVISING',
    stageLabel: 'Studio Đang Sửa Lỗi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    submittedAt: '2 ngày trước',
    promptsCount: 120,
    openTicketsCount: 2,
  },
  {
    id: 'queue-4',
    projectId: 'proj-rescue-bots',
    title: 'Biệt Đội Robot Cứu Hộ',
    episodeNumber: 4,
    totalEpisodes: 10,
    genre: 'Animation / Family',
    creatorName: 'Phạm Đức Anh (In-house Screenwriter)',
    studioName: 'CineSpark Production',
    stage: 'ARTICLE_44_APPROVED',
    stageLabel: 'Đã Cấp Phép Điều 44',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    submittedAt: '3 ngày trước',
    promptsCount: 180,
    openTicketsCount: 0,
  },
  {
    id: 'queue-5',
    projectId: 'proj-timeless-melody',
    title: 'Giai Điệu Vượt Thời Không',
    episodeNumber: 1,
    totalEpisodes: 4,
    genre: 'Drama / Musical AI',
    creatorName: 'Lê Minh Tuấn (In-house Screenwriter)',
    studioName: 'Chưa chuyển giao (Chờ duyệt kịch bản)',
    stage: 'SCRIPT_PENDING',
    stageLabel: 'Kịch Bản Chờ Thẩm Định',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Hôm nay, 08:30',
    promptsCount: 45,
    openTicketsCount: 0,
  },
];

export function ReviewerProjectQueuePage() {
  const [filter, setFilter] = useState<'all' | 'script' | 'master' | 'revising' | 'approved'>('all');
  const [search, setSearch] = useState('');

  const filteredItems = MOCK_QUEUE_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(search.toLowerCase()) ||
      item.studioName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'script') return item.stage === 'SCRIPT_PENDING';
    if (filter === 'master') return item.stage === 'MASTER_AUDIT';
    if (filter === 'revising') return item.stage === 'STUDIO_REVISING';
    if (filter === 'approved') return item.stage === 'ARTICLE_44_APPROVED';
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── 1. Header Trang ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-[#E50914] border border-red-500/20">
                MAIN FLOW 1
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Thẩm Định & Tuân Thủ Pháp Lý
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hàng Đợi Thẩm Định & Kiểm Duyệt Kịch Bản
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Kiểm duyệt kịch bản phân cảnh từ In-house Creator, thẩm định bản dựng Master 4K từ Studio và cấp chứng nhận Điều 44 Luật AI.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/reviewer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all cursor-pointer"
            >
              <Clapperboard className="w-4 h-4" />
              <span>Vào Bàn Thẩm Định Video Master ➔</span>
            </Link>
          </div>
        </div>

        {/* ── 2. 4 Thẻ Thống Kê Trọng Tâm ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kịch bản chờ duyệt */}
          <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-2 shadow-xs transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Kịch Bản Chờ Duyệt</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">4</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Bản thảo Final Draft</span>
            </div>
            <p className="text-[11px] text-slate-500">Từ In-house Screenwriters</p>
          </div>

          {/* Card 2: Master đang kiểm */}
          <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-2 shadow-xs transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Master Đang Thẩm Định</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#E50914] flex items-center justify-center">
                <Clapperboard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">2</span>
              <span className="text-xs text-[#E50914] font-medium">Bản dựng 4K ProRes</span>
            </div>
            <p className="text-[11px] text-slate-500">Studio đối tác đã bàn giao</p>
          </div>

          {/* Card 3: Yêu cầu Studio đang sửa */}
          <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-2 shadow-xs transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Studio Đang Khắc Phục</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">3</span>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Ticket lỗi timestamp</span>
            </div>
            <p className="text-[11px] text-slate-500">Đang chờ bản render lại</p>
          </div>

          {/* Card 4: Đã cấp phép Điều 44 */}
          <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-2 shadow-xs transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Đã Cấp Phép Điều 44</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">12</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Sẵn sàng Publish</span>
            </div>
            <p className="text-[11px] text-slate-500">Chuyển giao cho Admin duyệt</p>
          </div>
        </div>

        {/* ── 3. Bộ Lọc Trạng Thái & Tìm Kiếm ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              Tất cả ({MOCK_QUEUE_ITEMS.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('script')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'script'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              📑 Kịch bản chờ duyệt (2)
            </button>

            <button
              type="button"
              onClick={() => setFilter('master')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'master'
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              🎬 Master cần kiểm (1)
            </button>

            <button
              type="button"
              onClick={() => setFilter('revising')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'revising'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              🛠️ Studio đang sửa (1)
            </button>

            <button
              type="button"
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              ⚖️ Đã cấp phép Điều 44 (1)
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên phim, Studio, Creator..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#E50914] shadow-xs"
            />
          </div>
        </div>

        {/* ── 4. Danh Sách Các Hạng Mục Thẩm Định (Queue Cards) ── */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
            >
              {/* Cột 1: Thumbnail + Title + Details */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-black/80 shrink-0 border border-slate-200 dark:border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    Tập {item.episodeNumber}/{item.totalEpisodes}
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {item.genre}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.submittedAt}</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {item.title} — Tập {item.episodeNumber < 10 ? `0${item.episodeNumber}` : item.episodeNumber}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Biên kịch: <strong className="text-slate-800 dark:text-slate-200">{item.creatorName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#E50914]" />
                      <span>Studio: <strong className="text-slate-800 dark:text-slate-200">{item.studioName}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Trạng Thái Quy Trình */}
              <div className="shrink-0 flex items-center gap-3">
                <div className="space-y-1 text-right sm:text-left lg:text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      item.stage === 'MASTER_AUDIT'
                        ? 'bg-red-500/10 text-[#E50914] border-red-500/20 shadow-xs animate-pulse'
                        : item.stage === 'SCRIPT_PENDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : item.stage === 'STUDIO_REVISING'
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {item.stage === 'MASTER_AUDIT' && <Clapperboard className="w-3 h-3" />}
                    {item.stage === 'SCRIPT_PENDING' && <FileCheck2 className="w-3 h-3" />}
                    {item.stage === 'STUDIO_REVISING' && <AlertTriangle className="w-3 h-3" />}
                    {item.stage === 'ARTICLE_44_APPROVED' && <ShieldCheck className="w-3 h-3" />}
                    <span>{item.stageLabel}</span>
                  </span>

                  <p className="text-[11px] text-slate-500">
                    {item.openTicketsCount > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {item.openTicketsCount} góp ý lỗi đang sửa
                      </span>
                    ) : (
                      <span>Khai báo {item.promptsCount} AI prompts</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Cột 3: Nút Hành Động Trực Tiếp */}
              <div className="shrink-0">
                {item.stage === 'MASTER_AUDIT' ? (
                  <Link
                    href="/reviewer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all cursor-pointer"
                  >
                    <Clapperboard className="w-3.5 h-3.5" />
                    <span>Mở Bàn Thẩm Định Master ➔</span>
                  </Link>
                ) : item.stage === 'SCRIPT_PENDING' ? (
                  <Link
                    href="/reviewer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Thẩm Định Kịch Bản ➔</span>
                  </Link>
                ) : item.stage === 'STUDIO_REVISING' ? (
                  <Link
                    href="/reviewer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Theo Dõi Sửa Lỗi ({item.openTicketsCount})</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã Gắn Nhãn Điều 44</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
