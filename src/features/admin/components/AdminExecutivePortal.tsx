'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Rocket,
  ShieldCheck,
  Building2,
  FileSignature,
  Clapperboard,
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { CreateB2BProjectModal } from './CreateB2BProjectModal';
import { SignContractModal } from './SignContractModal';
import { AdminOverviewDashboard } from './AdminOverviewDashboard';

interface PublishReadyMovie {
  id: string;
  title: string;
  episodesCount: number;
  thumbnailUrl: string;
  studioName: string;
  reviewerName: string;
  genre: string;
  complianceArticle44: boolean;
  published: boolean;
}

const INITIAL_READY_MOVIES: PublishReadyMovie[] = [
  {
    id: 'mov-cyber-saigon',
    title: 'Cyber Saigon 2077: Mạng Lưới Ngầm',
    episodesCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    studioName: 'Saigon VFX Lab',
    reviewerName: 'Trần Gia Huy',
    genre: 'Sci-Fi / Cyberpunk',
    complianceArticle44: true,
    published: false,
  },
  {
    id: 'mov-neo-hanoi',
    title: 'Mạng Lưới Sinh Học: Neo Hanoi 2085',
    episodesCount: 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=800&q=80',
    studioName: 'Ares Animation Studio',
    reviewerName: 'Nguyễn Văn Nam',
    genre: 'Bio-Thriller / AI',
    complianceArticle44: true,
    published: false,
  },
];

export function AdminExecutivePortal() {
  const [activeTab, setActiveTab] = useState<'b2b_projects' | 'analytics_charts'>('b2b_projects');
  const [timeRange, setTimeRange] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [readyMovies, setReadyMovies] = useState<PublishReadyMovie[]>(INITIAL_READY_MOVIES);

  // Metric numbers
  const [metrics, setMetrics] = useState({
    totalProjects: 12,
    streamedMovies: 5,
    activeContracts: 3,
    pendingFinalScripts: 2,
    awaitingPublish: 2,
  });

  const handleProjectCreated = (newProj: {
    id: string;
    title: string;
    genre: string;
    episodesCount: number;
    assignedCreator: string;
    budgetVnd: number;
    synopsis: string;
  }) => {
    setMetrics((prev) => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      pendingFinalScripts: prev.pendingFinalScripts + 1,
    }));
  };

  const handleContractSigned = () => {
    setContractSigned(true);
    setMetrics((prev) => ({
      ...prev,
      activeContracts: prev.activeContracts + 1,
    }));
  };

  const handlePublishMovie = (movieId: string, movieTitle: string) => {
    setReadyMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, published: true } : m))
    );
    setMetrics((prev) => ({
      ...prev,
      streamedMovies: prev.streamedMovies + 1,
      awaitingPublish: Math.max(0, prev.awaitingPublish - 1),
    }));

    toast.success(
      'Phát Hành OTT Thành Công! 🚀',
      `Tác phẩm "${movieTitle}" đã chính thức lên sóng trang chủ AI Cinema và gửi thông báo tới toàn bộ khán giả.`
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#090B10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Sub-tabs điều hướng: Main Flow 1 vs Charts */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('b2b_projects')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'b2b_projects'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Quản Trị Dự Án & B2B (Main Flow 1)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics_charts')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'analytics_charts'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Biểu Đồ Doanh Thu & Vận Hành OTT</span>
          </button>
        </div>

        {activeTab === 'analytics_charts' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            {/* ── 1. Khung Header / Profile Admin (Tầng trên cùng) ── */}
            <section
              aria-label="Hồ sơ quản trị viên"
              className="rounded-2xl bg-[#111420] border border-white/[0.08] p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Avatar circle */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shrink-0 shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#111420] flex items-center justify-center font-black text-2xl text-white">
                    A
                  </div>
                </div>

                {/* Name & Handle */}
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Quản Trị Viên Hệ Thống</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[#E50914] text-[10px] font-mono border border-red-500/20 font-bold">
                      Executive Admin
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium font-mono">
                    admin@aicinema.vn • <span className="text-emerald-400 font-sans font-semibold">B2B Studio Contract & Release Authority</span>
                  </p>
                </div>
              </div>

              {/* Action Button: [ + Khởi Tạo Dự Án Mới ] */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Khởi Tạo Dự Án Mới</span>
                </button>
              </div>
            </section>

            {/* ── 2. Khung Số Liệu Trọng Tâm (Metrics - Tương tự Earnings trong BMC) ── */}
            <section
              aria-label="Thống kê dự án và hợp đồng"
              className="rounded-2xl bg-[#111420] border border-white/[0.08] p-6 sm:p-7 shadow-xl space-y-5 transition-all"
            >
              {/* Top Row: Title + Time Dropdown */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Dự Án & Hợp Đồng Đang Chạy
                </h2>

                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    aria-label="Khoảng thời gian thống kê"
                    className="appearance-none rounded-xl border border-white/[0.08] bg-black/40 pl-4 pr-8 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-[#E50914] cursor-pointer"
                  >
                    <option value="all">Toàn bộ thời gian</option>
                    <option value="quarter">Quý này (Quý IV)</option>
                    <option value="30d">30 ngày qua</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Big Number Headline */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
                    {metrics.totalProjects}
                  </span>
                  <span className="text-base font-bold text-slate-400">
                    Dự án phim điện ảnh AI trong hệ thống
                  </span>
                </div>
              </div>

              {/* Colored Dot Breakdown */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-slate-300">
                {/* Dot 1: Green - Phim đã lên sóng */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>{metrics.streamedMovies}</strong> Phim đã lên sóng OTT</span>
                </div>

                {/* Dot 2: Purple - Hợp đồng Studio */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                  <span><strong>{metrics.activeContracts}</strong> Hợp đồng đã ký với Studio (Đang dựng)</span>
                </div>

                {/* Dot 3: Yellow - Kịch bản chờ chốt */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>{metrics.pendingFinalScripts}</strong> Kịch bản chờ Admin duyệt Final</span>
                </div>

                {/* Dot 4: Red - Chờ Publish */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shrink-0" />
                  <span><strong>{metrics.awaitingPublish}</strong> Phim đang chờ Publish lên trang chủ</span>
                </div>
              </div>
            </section>

            {/* ── 3. Khu Vực Phê Duyệt Nhanh (Thay cho Empty State) ── */}
            <section
              aria-label="Ký duyệt hợp đồng Studio mới nhất"
              className="rounded-2xl bg-gradient-to-r from-[#111420] via-[#151928] to-[#111420] border border-white/[0.08] p-6 sm:p-7 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-xs">
                    <FileSignature className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                        Ký Duyệt Hợp Đồng Studio Mới Nhất
                      </span>
                      {contractSigned ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ĐÃ KÝ ĐIỆN TỬ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                          CHỜ ADMIN KÝ DUYỆT
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      Dự án: <span className="text-white">Cyber Saigon 2077</span> • Đối tác: <span className="text-indigo-300">Saigon VFX Studio</span>
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Báo giá đề xuất: <strong className="text-emerald-400 font-mono">150,000,000 VND</strong> (Trọn bộ 5 tập 4K Master). Kịch bản phân cảnh đã được Reviewer và In-house Creator xác nhận hoàn thiện.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsContractModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-[#E50914]/40 hover:border-[#E50914] text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>{contractSigned ? 'Xem Lại Hợp Đồng Số' : 'Xem Chi Tiết Báo Giá & Ký Số ➔'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ── 4. Bảng Danh Sách Phim Chờ Phát Hành OTT (Tầng dưới cùng) ── */}
            <section aria-label="Phim đã kiểm định pháp lý" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-[#E50914]" />
                    <span>Phim Đã Kiểm Định Pháp Lý — Sẵn Sàng Phát Hành</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Các tác phẩm đã được Reviewer đối soát kỹ thuật, hoàn tất nghĩa vụ bản quyền và gắn nhãn Tuân Thủ AI (Điều 44).
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                  {readyMovies.filter((m) => !m.published).length} Tác phẩm chờ lên sóng
                </span>
              </div>

              {/* List of Ready Movies */}
              <div className="space-y-3">
                {readyMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="rounded-2xl bg-[#111420] border border-white/[0.08] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md"
                  >
                    {/* Cột 1: Thumbnail + Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={movie.thumbnailUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {movie.episodesCount} Tập
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {movie.genre}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white truncate">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Thẩm định viên phụ trách: <span className="text-slate-300 font-medium">{movie.reviewerName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Cột 2: Badge Tuân Thủ AI Điều 44 */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-bold shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Đã gắn nhãn AI Điều 44</span>
                      </span>
                    </div>

                    {/* Cột 3: Studio gia công */}
                    <div className="shrink-0 text-xs">
                      <span className="text-slate-500 block text-[10px]">Studio Gia Công:</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{movie.studioName}</span>
                      </span>
                    </div>

                    {/* Cột 4: Nút Phát Hành Lên Trang Chủ */}
                    <div className="shrink-0">
                      {movie.published ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã Lên Sóng OTT</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublishMovie(movie.id, movie.title)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 transition-all cursor-pointer"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Bấm Phát Hành Lên Trang Chủ</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateB2BProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <SignContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onContractSigned={handleContractSigned}
      />
    </div>
  );
}
