'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import type { ScriptFilterKey } from './types';

interface StudioFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: ScriptFilterKey;
  onFilterChange: (filter: ScriptFilterKey) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

const FILTER_OPTIONS: { key: ScriptFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'draft', label: 'Bản nháp' },
  { key: 'review', label: 'Chờ Reviewer duyệt' },
  { key: 'admin_approval', label: 'Chờ Admin chốt' },
  { key: 'handed_off', label: 'Đã chuyển giao Studio' },
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
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2">
      {/* Filter Tabs - Rounded Pill Buy Me a Coffee style */}
      <div
        role="tablist"
        aria-label="Lọc trạng thái kịch bản phân cảnh"
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
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold'
                  : 'bg-white dark:bg-[#141724] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <span>{label}</span>
              {isActive && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-700 dark:bg-slate-200 text-[10px] font-bold text-white dark:text-slate-900">
                  {totalFilteredCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search Input & View Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input with rounded-full */}
        <div className="relative flex-1 md:w-72">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên kịch bản, thể loại..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-all shadow-xs"
          />
        </div>

        {/* View Mode Toggle with rounded-full */}
        <div
          role="group"
          aria-label="Chế độ hiển thị"
          className="flex items-center p-1 rounded-full bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shrink-0"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Dạng Lưới (Grid)"
            aria-pressed={viewMode === 'grid'}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Dạng Bảng (Table)"
            aria-pressed={viewMode === 'table'}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
