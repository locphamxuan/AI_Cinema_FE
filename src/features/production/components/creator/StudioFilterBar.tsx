'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import type { StudioFilterKey } from './types';

interface StudioFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: StudioFilterKey;
  onFilterChange: (filter: StudioFilterKey) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

const FILTER_OPTIONS: { key: StudioFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'published', label: 'Đang phát hành' },
  { key: 'review', label: 'Chờ thẩm định' },
  { key: 'revision', label: 'Cần chỉnh sửa' },
  { key: 'draft', label: 'Bản nháp' },
];

export function StudioFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}: StudioFilterBarProps) {
  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-white/[0.08]">
      {/* Filter Pills with Dual Light (Indigo) & Dark (Cinema Red) */}
      <div
        role="tablist"
        aria-label="Lọc danh mục dự án phim"
        className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
      >
        {FILTER_OPTIONS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 dark:bg-[#E50914] text-white shadow-xs dark:shadow-md dark:shadow-red-950/50 font-bold'
                  : 'bg-white dark:bg-[#131722] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span>{label}</span>
              {isActive && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 dark:bg-black/40 text-[10px] font-bold text-white">
                  {totalFilteredCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search & View Mode Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 md:w-72">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo tên phim, thể loại..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-[#E50914] focus:ring-1 focus:ring-indigo-500 dark:focus:ring-[#E50914] transition-all shadow-xs"
          />
        </div>

        {/* View Mode Toggle */}
        <div
          role="group"
          aria-label="Chế độ hiển thị"
          className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#131722] border border-slate-200 dark:border-white/[0.08] shrink-0"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Dạng Lưới (Grid)"
            aria-pressed={viewMode === 'grid'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Dạng Bảng (List)"
            aria-pressed={viewMode === 'table'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
