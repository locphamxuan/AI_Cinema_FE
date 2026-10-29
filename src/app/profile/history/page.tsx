'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Clock, Film, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { playbackService } from '@/services/playbackService';
import type { WatchHistoryItem } from '@/types/playback';
import type { Page } from '@/types/production';

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function WatchHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAppStore();
  const [pageData, setPageData] = useState<Page<WatchHistoryItem> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    playbackService
      .getHistory(currentPage, 12)
      .then((res) => {
        if (res.success && res.data) {
          setPageData(res.data);
          setError(null);
        } else {
          setError(res.message || 'Không thể tải lịch sử xem.');
        }
      })
      .catch(() => setError('Lỗi kết nối khi tải lịch sử xem.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, currentPage]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập để xem lịch sử</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Lưu lại tiến trình xem phim của bạn trên mọi thiết bị và xem tiếp dễ dàng bất cứ lúc nào.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-lg shadow-ruby/20 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const items = pageData?.data ?? [];
  const meta = pageData?.meta;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 px-4 sm:px-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby text-sm">
              <Clock className="w-4 h-4" />
            </span>
            Lịch Sử Xem Phim
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tiến trình các tập phim bạn đã xem và tiếp tục xem ngay tại vị trí đã dừng.
          </p>
        </div>

        <Link
          href="/phim"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ruby bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors w-fit"
        >
          <Film className="w-3.5 h-3.5" />
          Khám phá thêm phim
        </Link>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-44 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && items.length === 0 && (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.01]">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Bạn chưa xem phim nào</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hãy chọn một bộ phim yêu thích để bắt đầu trải nghiệm rạp chiếu AI!
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-md shadow-ruby/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Khám phá phim ngay
          </Link>
        </div>
      )}

      {/* ── History Items Grid ── */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const duration = item.durationSeconds ?? 0;
            const progress = duration > 0 ? Math.min(100, Math.round((item.positionSeconds / duration) * 100)) : 0;

            return (
              <div
                key={item.episodeId}
                className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md hover:border-ruby/30 transition-all flex flex-col justify-between"
              >
                {/* Thumbnail & Progress Bar */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.episodeTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1.5">
                      <Film className="w-8 h-8 opacity-40" />
                      <span className="text-[11px] font-mono">Tập {item.episodeNumber}</span>
                    </div>
                  )}

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      Tập {item.episodeNumber}
                    </span>
                    {item.completed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600/90 text-[10px] font-bold text-white">
                        <CheckCircle2 className="w-3 h-3" /> Đã xem xong
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => router.push(`/watch/${item.episodeId}`)}
                    aria-label={`Xem tiếp ${item.episodeTitle}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-ruby text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </button>

                  {/* Progress Line Bar at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div
                      className="h-full bg-gradient-to-r from-ruby to-amber-500 rounded-r-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ruby truncate">
                      {item.movieTitle}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {item.episodeTitle}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between font-mono">
                      <span>
                        {formatDuration(item.positionSeconds)} / {formatDuration(item.durationSeconds)}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span>{formatDate(item.lastWatchedAt)}</span>
                      <button
                        type="button"
                        onClick={() => router.push(`/watch/${item.episodeId}`)}
                        className="font-bold text-ruby hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Xem tiếp →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
            Trang {currentPage} / {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= meta.totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
