'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clapperboard,
  ShieldCheck,
  AlertTriangle,
  Search,
  Building2,
  User,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  Share2,
  CheckCircle2,
  Film,
  Cpu,
  ChevronDown,
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
  creatorAvatar: string;
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
    creatorName: 'Lê Minh Tuấn',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
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
    creatorName: 'Trần Quỳnh Nga',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
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
    creatorName: 'Nguyễn Văn Nam',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
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
    creatorName: 'Phạm Đức Anh',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
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
    creatorName: 'Lê Minh Tuấn',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    studioName: 'Chưa chuyển giao (Chờ duyệt kịch bản)',
    stage: 'SCRIPT_PENDING',
    stageLabel: 'Kịch Bản Chờ Thẩm Định',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Hôm nay, 08:30',
    promptsCount: 45,
    openTicketsCount: 0,
  },
  {
    id: 'queue-6',
    projectId: 'proj-ocean-abyss',
    title: 'Vực Thẳm Đại Dương: Vệ Tinh 03',
    episodeNumber: 2,
    totalEpisodes: 6,
    genre: 'Sci-Fi / Underwater',
    creatorName: 'Trần Quỳnh Nga',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    studioName: 'Saigon VFX Lab',
    stage: 'MASTER_AUDIT',
    stageLabel: 'Bản Dựng Master 4K Sẵn Sàng',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Hôm qua, 14:10',
    promptsCount: 110,
    openTicketsCount: 1,
  },
];

export function ReviewerProjectQueuePage() {
  const [filter, setFilter] = useState<'all' | 'script' | 'master' | 'revising' | 'approved'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

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

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép liên kết bàn thẩm định', 'Liên kết đã được lưu vào bộ nhớ tạm.');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── 1. Top Profile Greeting Card (Buy Me a Coffee / Playful Persona style) ── */}
        <section
          aria-label="Hồ sơ thẩm định viên"
          className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all"
        >
          <div className="flex items-center gap-4">
            {/* Avatar circle with glow badge */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-[#151928] border-2 border-red-500/40 p-0.5 shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
                alt="Avatar Compliance Reviewer"
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111420]" title="Đang trực thẩm định" />
            </div>

            {/* Name, Handle & Bio */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hi, Thẩm Định Viên Pháp Lý 👋
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-[#E50914] border border-red-500/20">
                  Điều 44 Certified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                aicinema.vn/reviewer/<span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">@compliance</span> • Ban Kiểm Duyệt Kịch Bản & Bản Dựng OTT
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Chia Sẻ</span>
            </button>

            <Link
              href="/reviewer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <Clapperboard className="w-4 h-4" />
              <span>Bàn Thẩm Định Video Master ➔</span>
            </Link>
          </div>
        </section>

        {/* ── 2. Khung Số Liệu Trọng Tâm (Playful Metrics Strip) ── */}
        <section
          aria-label="Thống kê thẩm định"
          className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs dark:shadow-xl space-y-4 transition-all"
        >
          {/* Header Row: Title + Time filter dropdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Tiến Độ Thẩm Định & Tuân Thủ AI
              </h2>
            </div>

            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                aria-label="Khoảng thời gian thống kê"
                className="appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 pl-3.5 pr-8 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#E50914] cursor-pointer shadow-xs"
              >
                <option value="30d">30 ngày qua</option>
                <option value="quarter">Quý IV / 2026</option>
                <option value="all">Toàn bộ thời gian</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Big Number Headline */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
              18
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
              Tập phim & kịch bản đang trong quy trình thẩm định
            </span>
          </div>

          {/* Colored Dot Breakdown */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-white/[0.04]">
            {/* Dot 1: Amber - Kịch bản chờ duyệt */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-xs" />
              <span><strong>4</strong> Kịch bản chờ duyệt</span>
            </div>

            {/* Dot 2: Red Ruby - Master 4K sẵn sàng */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shrink-0 shadow-xs" />
              <span><strong>2</strong> Bản Master 4K sẵn sàng</span>
            </div>

            {/* Dot 3: Sky - Studio đang sửa */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0 shadow-xs" />
              <span><strong>3</strong> Ticket Studio đang sửa</span>
            </div>

            {/* Dot 4: Emerald - Đã cấp phép Điều 44 */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
              <span><strong>12</strong> Đã cấp phép Điều 44 (Sẵn sàng OTT)</span>
            </div>
          </div>
        </section>

        {/* ── 3. Thanh Lọc Trạng Thái & Chuyển Đổi Chế Độ Xem ── */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Filter Pills with charming icons & badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-2xl transition-all cursor-pointer shadow-xs ${
                filter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              ✨ Tất cả ({MOCK_QUEUE_ITEMS.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('script')}
              className={`px-3.5 py-2 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                filter === 'script'
                  ? 'bg-amber-500 text-white shadow-amber-500/25'
                  : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span>📑 Kịch bản chờ duyệt</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('master')}
              className={`px-3.5 py-2 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                filter === 'master'
                  ? 'bg-[#E50914] text-white shadow-[#E50914]/25'
                  : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span>🎬 Master cần kiểm</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-[#E50914]">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('revising')}
              className={`px-3.5 py-2 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                filter === 'revising'
                  ? 'bg-sky-500 text-white shadow-sky-500/25'
                  : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span>🛠️ Studio đang sửa</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400">
                1
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('approved')}
              className={`px-3.5 py-2 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                  : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span>⚖️ Đã cấp Điều 44</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                1
              </span>
            </button>
          </div>

          {/* Right: Search Input + View Mode Switcher (Grid / List) */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm phim, Studio, Creator..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#E50914] shadow-xs"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Xem dạng thẻ poster lớn"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Xem dạng danh sách bảng"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. Khu Vực Hiển Thị Thẻ Dự Án (Chế độ Grid / Table) ── */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col h-full rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* 16:9 Thumbnail Poster with smooth hover zoom */}
                <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Left Glassmorphism Pill: Studio */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-black/75 backdrop-blur-md border border-slate-200/60 dark:border-white/15 text-slate-800 dark:text-slate-200 shadow-xs">
                      <Building2 className="w-3 h-3 text-[#E50914]" />
                      <span className="truncate max-w-[130px]">{item.studioName}</span>
                    </span>
                  </div>

                  {/* Top-Right Badge: Episode Counter */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/75 backdrop-blur-md text-white border border-white/15 shadow-xs">
                      Tập {item.episodeNumber < 10 ? `0${item.episodeNumber}` : item.episodeNumber} / {item.totalEpisodes < 10 ? `0${item.totalEpisodes}` : item.totalEpisodes}
                    </span>
                  </div>

                  {/* Bottom overlay info on visual */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white z-10">
                    <span className="font-semibold text-white/90 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/70" />
                      <span>{item.submittedAt}</span>
                    </span>

                    <span className="font-bold uppercase tracking-wider text-amber-300 text-[10px]">
                      {item.genre}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Status Badge Pill */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                          item.stage === 'MASTER_AUDIT'
                            ? 'bg-red-500/10 text-[#E50914] border-red-500/20 animate-pulse'
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
                    </div>

                    {/* Movie Title */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#E50914] transition-colors">
                      {item.title}
                    </h3>

                    {/* Screenwriter Avatar + Name */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.creatorAvatar}
                        alt={item.creatorName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-white/20"
                      />
                      <span>Biên kịch: <strong className="text-slate-800 dark:text-slate-200">{item.creatorName}</strong></span>
                    </div>
                  </div>

                  {/* Card Footer: Metadata + Action Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Cpu className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                        <span>Khai báo {item.promptsCount} prompts AI</span>
                      </span>

                      {item.openTicketsCount > 0 && (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {item.openTicketsCount} lỗi cần sửa
                        </span>
                      )}
                    </div>

                    {/* Interactive Action Button */}
                    {item.stage === 'MASTER_AUDIT' ? (
                      <Link
                        href="/reviewer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all cursor-pointer"
                      >
                        <Clapperboard className="w-3.5 h-3.5" />
                        <span>Mở Bàn Thẩm Định Master ➔</span>
                      </Link>
                    ) : item.stage === 'SCRIPT_PENDING' ? (
                      <Link
                        href="/reviewer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Thẩm Định Kịch Bản ➔</span>
                      </Link>
                    ) : item.stage === 'STUDIO_REVISING' ? (
                      <Link
                        href="/reviewer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Theo Dõi Tiến Độ Sửa Lỗi ({item.openTicketsCount})</span>
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã Cấp Phép Điều 44 (Sẵn Sàng OTT)</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Table View Alternative */
          <div className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Dự Án & Tập Phim</th>
                    <th className="py-3.5 px-4">Biên Kịch</th>
                    <th className="py-3.5 px-4">Studio Gia Công</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-12 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-white/10"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 font-mono">Tập {item.episodeNumber} / {item.totalEpisodes} • {item.genre}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.creatorName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.studioName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            item.stage === 'MASTER_AUDIT'
                              ? 'bg-red-500/10 text-[#E50914] border-red-500/20'
                              : item.stage === 'SCRIPT_PENDING'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : item.stage === 'STUDIO_REVISING'
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {item.stageLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/reviewer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Thẩm Định</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
