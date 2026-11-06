'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Landmark,
  Film,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Empty } from '@/features/production/components/shared/ui';
import { FEE_ENTRY } from '@/features/production/lib/labels';
import { formatNumber } from '@/features/production/lib/format';
import type { ReviewerWallet, TokenHistoryEntry, TokenTotals } from '@/types/reviewer-token';

/**
 * Format timestamp into clean Enterprise format: 21:09 • 03/11/2026
 */
function formatFintechDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time} • ${date}`;
}

/**
 * High-End FinTech Top Metric Cards:
 * - Card 1: Hero Card with Gradient Indigo-Violet, glowing wallet icon, white progress bar
 * - Card 2: Admin Allocated with Blue Bank icon
 * - Card 3: Allocated to Projects with Amber Film Reel icon
 */
export function TokenTotalsCards({ totals, rateVnd }: { totals: TokenTotals; rateVnd: number }) {
  const balance = totals.balanceTokens;
  const granted = totals.grantedTokens || 1;
  const allocated = totals.allocatedTokens;

  const balanceVnd = balance * rateVnd;
  const grantedVnd = granted * rateVnd;
  const allocatedVnd = allocated * rateVnd;

  // Calculate percentage of available budget
  const availablePercent = Math.min(100, Math.max(0, (balance / granted) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── CARD 1: HERO CARD (Tâm điểm thị giác) ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl shadow-indigo-600/15 border border-indigo-400/30 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
        {/* Glow & Radial mesh overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-indigo-100 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Hạn ngạch khả dụng (Token còn lại)
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mt-3.5">
                {formatNumber(balance)}{' '}
                <span className="text-lg sm:text-xl font-bold font-sans opacity-90">Token</span>
              </p>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-mono mt-1">
                ≈ {formatNumber(balanceVnd)} ₫
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold mb-1.5">
            <span>Tiến độ ngân sách</span>
            <span className="font-mono">{availablePercent.toFixed(1)}% khả dụng</span>
          </div>
          <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden backdrop-blur-xs">
            <div
              className="bg-white dark:bg-indigo-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${availablePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: ADMIN ĐÃ PHÂN BỔ ── */}
      <div className="relative rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Admin đã phân bổ
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                {formatNumber(granted)}{' '}
                <span className="text-base font-semibold font-sans text-slate-500 dark:text-slate-400">Token</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                ≈ {formatNumber(grantedVnd)} ₫
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">Được cấp từ Quỹ Phát Triển Hệ Thống</span>
        </div>
      </div>

      {/* ── CARD 3: ĐÃ CẤP CHO DỰ ÁN PHIM ── */}
      <div className="relative rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Đã cấp cho dự án phim
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                {formatNumber(allocated)}{' '}
                <span className="text-base font-semibold font-sans text-slate-500 dark:text-slate-400">Token</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                ≈ {formatNumber(allocatedVnd)} ₫
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
              <Film className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
            Đã phân bổ cho các dự án phim
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Returns category badge representation with custom icon and colors
 */
function TransactionCategoryBadge({ entry }: { entry: TokenHistoryEntry }) {
  if (entry.kind === 'GRANT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20">
        <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        Nạp quỹ Admin
      </span>
    );
  }

  if (entry.kind === 'REVOKE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
        Admin thu hồi
      </span>
    );
  }

  if (entry.category === 'CREATOR_REQUEST') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
        <PlusCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        Creator yêu cầu
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
      <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
      Cấp hạn ngạch {entry.feeEntryType ? `· ${FEE_ENTRY[entry.feeEntryType]}` : ''}
    </span>
  );
}

const ITEMS_PER_PAGE = 6;

/**
 * Enterprise FinTech Ledger Table with Search, Project Filter and 6-items-per-page Pagination
 */
export function TokenHistoryTable({
  wallet,
  entries = wallet.history,
  projectHref,
}: {
  wallet: ReviewerWallet;
  entries?: TokenHistoryEntry[];
  projectHref?: (movieId: string) => string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract distinct movies for filter dropdown
  const distinctMovies = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => {
      if (e.movie?.id && e.movie?.title) {
        map.set(e.movie.id, e.movie.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [entries]);

  // Filter entries based on search and movie
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.id.toLowerCase().includes(q) ||
        e.movie?.title?.toLowerCase().includes(q) ||
        e.reason?.toLowerCase().includes(q) ||
        e.by?.fullName?.toLowerCase().includes(q);

      const matchMovie = !selectedMovie || e.movie?.id === selectedMovie;

      return matchSearch && matchMovie;
    });
  }, [entries, searchTerm, selectedMovie]);

  // Pagination calculation
  const totalItems = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const currentEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const startDisplay = totalItems > 0 ? startIndex + 1 : 0;
  const endDisplay = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  if (entries.length === 0) {
    return <Empty>Chưa có giao dịch Token nào ở mục này.</Empty>;
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search & Project Filter ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo mã giao dịch, dự án, lý do..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-all"
          />
        </div>

        {/* Project Selector */}
        {distinctMovies.length > 0 && (
          <select
            value={selectedMovie}
            onChange={(e) => {
              setSelectedMovie(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Lọc theo dự án tiếp nhận"
            className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131722] px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-xs"
          >
            <option value="">Tất cả dự án phim</option>
            {distinctMovies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Enterprise Data Table ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10">
            <tr>
              <th scope="col" className="py-3.5 px-4">Thời gian</th>
              <th scope="col" className="py-3.5 px-4">Phân loại giao dịch</th>
              <th scope="col" className="py-3.5 px-4">Dự án tiếp nhận</th>
              <th scope="col" className="py-3.5 px-4 text-right">Biến động</th>
              <th scope="col" className="py-3.5 px-5">Ghi chú / Mục đích kiểm toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
            {currentEntries.length > 0 ? (
              currentEntries.map((e) => {
                const isPositive = e.amountTokens > 0;
                return (
                  <tr
                    key={`${e.kind}:${e.id}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors duration-150 cursor-default"
                  >
                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {formatFintechDateTime(e.createdAt)}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <TransactionCategoryBadge entry={e} />
                    </td>

                    {/* Movie / Season */}
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      {e.movie ? (
                        projectHref ? (
                          <Link
                            href={projectHref(e.movie.id)}
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block leading-tight"
                          >
                            {e.movie.title}
                          </Link>
                        ) : (
                          <span className="font-semibold block leading-tight">{e.movie.title}</span>
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                      {e.season && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                          Mùa {e.season.seasonNumber}
                          {e.season.title ? ` • ${e.season.title}` : ''}
                        </span>
                      )}
                    </td>

                    {/* Amount with FinTech Pill Badge */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          isPositive
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatNumber(e.amountTokens)} Token
                      </span>
                    </td>

                    {/* Audit Purpose */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 text-[11px] max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{e.reason ?? '-'}</p>
                      {e.by && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Bởi: {e.by.fullName}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy giao dịch nào khớp với điều kiện tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer & Professional Pagination ── */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <p>
            Hiển thị <span className="font-semibold text-slate-800 dark:text-slate-200">{startDisplay}</span> -{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{endDisplay}</span> trên tổng số{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> giao dịch
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-lg font-mono font-semibold transition cursor-pointer flex items-center justify-center ${
                  pageNumber === safePage
                    ? 'bg-indigo-600 dark:bg-[#E50914] text-white shadow-xs'
                    : 'border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer flex items-center gap-1"
            >
              Sau
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
