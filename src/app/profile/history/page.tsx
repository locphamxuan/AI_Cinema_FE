'use client';

import Link from 'next/link';

// Watch history needs a playback-tracking API (MF-3) that the backend does not have yet,
// so the page shows its empty state instead of inventing entries.
export default function WatchHistoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="pb-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">🕒 Lịch Sử Xem Phim</h1>
        <p className="text-sm text-slate-500 dark:text-muted-light">Danh sách các bộ phim bạn đã xem gần đây</p>
      </div>

      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-slate-500 dark:text-muted-light">Bạn chưa xem phim nào.</p>
        <Link href="/" className="inline-block text-sm font-bold text-ruby hover:underline">
          Khám phá phim →
        </Link>
      </div>
    </div>
  );
}
