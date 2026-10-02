'use client';

import { useState } from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface MotchillFilterBarProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  selectedFormat: 'all' | 'series' | 'single';
  onSelectFormat: (format: 'all' | 'series' | 'single') => void;
  sortBy: 'latest' | 'rating' | 'popular';
  onSelectSortBy: (sort: 'latest' | 'rating' | 'popular') => void;
  onReset: () => void;
  totalResults: number;
}

export default function MotchillFilterBar({
  selectedGenre,
  onSelectGenre,
  selectedFormat,
  onSelectFormat,
  sortBy,
  onSelectSortBy,
  onReset,
  totalResults,
}: MotchillFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const genres = [
    'Tất cả',
    'Cyberpunk',
    'Khoa học viễn tưởng',
    '3D AI Fantasy',
    'Hành động',
    'Võ thuật',
    'Giật gân',
    'Tội phạm',
    'Hoạt hình',
  ];

  const isFiltered = selectedGenre !== 'Tất cả' || selectedFormat !== 'all' || sortBy !== 'latest';

  return (
    <div className="my-6 px-4 sm:px-8 md:px-14">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#12151E] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
        {/* Toggle / Summary Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bộ Lọc Phim Nhanh (Motchill Filter)</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  ({totalResults} tác phẩm)
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isOpen ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc'}</span>
            </button>
          </div>
        </div>

        {/* Quick Genre Pills (Always Visible for Fast Access) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => onSelectGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedGenre === g
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Expanded Filters Drawer */}
        {isOpen && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in text-xs">
            {/* Format Filter */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block uppercase text-[10px] tracking-wider">
                Định Dạng Phim
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-black/30 p-1 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => onSelectFormat('all')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFormat === 'all'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => onSelectFormat('series')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFormat === 'series'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Phim Bộ (Series)
                </button>
                <button
                  onClick={() => onSelectFormat('single')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFormat === 'single'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Phim Lẻ
                </button>
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block uppercase text-[10px] tracking-wider">
                Sắp Xếp Theo
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-black/30 p-1 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => onSelectSortBy('latest')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    sortBy === 'latest'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => onSelectSortBy('rating')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    sortBy === 'rating'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Đánh giá cao
                </button>
                <button
                  onClick={() => onSelectSortBy('popular')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    sortBy === 'popular'
                      ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Phổ biến
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
