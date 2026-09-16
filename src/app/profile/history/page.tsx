'use client';

import { allMockMovies } from '@/mocks/mockData';
import Link from 'next/link';

export default function WatchHistoryPage() {
  const historyMovies = allMockMovies.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">🕒 Lịch Sử Xem Phim</h1>
          <p className="text-sm text-slate-500 dark:text-muted-light">Danh sách các bộ phim bạn đã xem gần đây</p>
        </div>

        <button className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer">
          Xóa toàn bộ lịch sử
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {historyMovies.map((movie, idx) => (
          <div
            key={movie.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md flex gap-4 group"
          >
            <div className="relative w-36 sm:w-44 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
              <img
                src={movie.bannerUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/watch/${movie.episodes[0]?.id || 'ep-001'}`}
                  className="w-9 h-9 rounded-full bg-ruby text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                >
                  ▶
                </Link>
              </div>

              {/* Progress bar overlay */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                <div
                  className="h-full bg-ruby rounded-r"
                  style={{ width: `${(idx + 1) * 22}%` }}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <span className="px-2 py-0.5 rounded bg-ruby/15 text-ruby text-[10px] font-black uppercase">
                  Tập {idx + 1} / {movie.totalEpisodes}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-1 group-hover:text-ruby transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-light line-clamp-2 mt-1">
                  {movie.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-muted-light pt-2">
                <span>Đã xem {(idx + 1) * 15} phút trước</span>
                <Link
                  href={`/watch/${movie.episodes[0]?.id || 'ep-001'}`}
                  className="font-bold text-ruby hover:underline"
                >
                  Xem tiếp →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
