'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { episodeAccessService } from '@/services/episodeAccessService';
import type { PurchasedEpisode } from '@/types/episodeAccess';
import type { Page } from '@/types/production';
import { DataPagination } from '@/components/data/DataPagination';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAppStore();
  const [pageData, setPageData] = useState<Page<PurchasedEpisode> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    episodeAccessService
      .getPurchasedEpisodes(currentPage, 12)
      .then((res) => {
        if (res.success && res.data) {
          setPageData(res.data);
          setError(null);
        } else {
          setError(res.message || 'Không thể tải danh sách tập phim đã mua.');
        }
      })
      .catch(() => setError('Lỗi kết nối khi tải kho phim đã mua.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, currentPage]);

  const goToPage = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập để xem kho phim đã mua</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tất cả các tập phim bạn đã dùng Coin để mở khóa vĩnh viễn sẽ được lưu trữ an toàn tại đây.
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
          <h1 className="flex items-center gap-2.5 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Kho tập phim đã mua
            {meta && (
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 tabular-nums">
                {meta.totalItems} tập
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Các tập phim và mùa phim bạn đã dùng Coin để mở khóa vĩnh viễn trên nền tảng AI Cinema.
          </p>
        </div>

        <Link
          href="/phim"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ruby bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors w-fit"
        >
          Khám phá thêm phim
        </Link>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
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
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Bạn chưa mở khóa tập phim nào</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Khi dùng Coin để mở khóa các tập phim trả phí, bạn có thể xem lại tại đây bất cứ lúc nào mà không cần đăng ký VIP.
            </p>
          </div>
          <Link
            href="/phim"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-md shadow-ruby/20 transition-all"
          >
            Khám phá phim ngay
          </Link>
        </div>
      )}

      {/* ── Purchased Items Grid ── */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                {item.episode.thumbnailUrl ? (
                  <img
                    src={item.episode.thumbnailUrl}
                    alt={item.episode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1.5">
                    <span className="text-[11px] tabular-nums">Tập {item.episode.episodeNumber}</span>
                  </div>
                )}

                {/* Badge on Thumbnail */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    Tập {item.episode.episodeNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600 text-[10px] font-bold text-white shadow-sm">
                    Đã mở khóa
                  </span>
                </div>

                {/* Play Button Overlay */}
                <button
                  type="button"
                  onClick={() => router.push(`/watch/${item.episode.id}`)}
                  aria-label={`Xem ${item.episode.title}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 truncate">
                    {item.movie.title}
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {item.episode.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 tabular-nums font-bold text-amber-600 dark:text-amber-400">
                    {item.paidCoins > 0 ? `${item.paidCoins} Coin` : 'Miễn phí'}
                  </span>
                  <span>{formatDate(item.grantedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <DataPagination
        page={currentPage}
        totalPages={meta?.totalPages ?? 1}
        totalItems={meta?.totalItems}
        pageSize={meta?.itemsPerPage}
        unit="tập đã mua"
        onChange={goToPage}
      />
    </div>
  );
}
