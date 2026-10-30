'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationPagerProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPage: (page: number) => void;
}

/** Numbered paging under the notification list, with the range shown on this page. */
export function NotificationPager({ page, totalPages, totalItems, pageSize, onPage }: NotificationPagerProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pt-6 border-t border-slate-100 dark:border-white/5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Hiển thị <span className="font-semibold text-slate-900 dark:text-white">{Math.min(totalItems, (page - 1) * pageSize + 1)}</span>–
        <span className="font-semibold text-slate-900 dark:text-white">{Math.min(totalItems, page * pageSize)}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> thông báo
      </p>

      <nav aria-label="Phân trang thông báo" className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Trang trước</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                p === page
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Trang sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </nav>
    </div>
  );
}
