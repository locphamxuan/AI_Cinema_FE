'use client';

import { BookOpen, CheckCircle2, Layers } from 'lucide-react';

interface KnowledgeMetricsProps {
  totalCount: number;
  publishedCount: number;
  categoryCount: number;
}

export function KnowledgeMetrics({
  totalCount,
  publishedCount,
  categoryCount,
}: KnowledgeMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-white/20">
        <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tổng số bài viết
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {totalCount}
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-white/20">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Đã nạp vào AI (Xuất bản)
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {publishedCount}
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-white/20">
        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Danh mục chủ đề
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {categoryCount}
          </p>
        </div>
      </div>
    </div>
  );
}
