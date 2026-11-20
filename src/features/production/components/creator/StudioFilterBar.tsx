'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import type { ScriptFilterKey } from './scriptItems';

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
  { key: 'draft', label: 'Chưa nộp' },
  { key: 'review', label: 'Reviewer & cần sửa' },
  { key: 'admin_approval', label: 'Chờ Admin chốt' },
  { key: 'handed_off', label: 'Kịch bản Final' },
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
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
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
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên phim, thể loại, Studio..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-card border border-border text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-ring transition-all shadow-xs"
          />
        </div>

        {/* View Mode Toggle with rounded-full */}
        <div
          role="group"
          aria-label="Chế độ hiển thị"
          className="flex items-center p-1 rounded-full bg-card border border-border shrink-0"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Dạng lưới (Grid)"
            aria-pressed={viewMode === 'grid'}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Dạng bảng (Table)"
            aria-pressed={viewMode === 'table'}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
