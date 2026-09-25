'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

/** Search box with instant suggestions from the loaded catalog. */
export default function HeaderSearch() {
  const { searchQuery, setSearchQuery, movies } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const results = query
    ? movies.filter((m) => m.title.toLowerCase().includes(query) || m.genre.some((g) => g.toLowerCase().includes(query)))
    : [];

  return (
    <div className="relative hidden md:block">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Tìm kiếm phim, diễn viên..."
          className="w-48 xl:w-64 pl-9 pr-8 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ruby/50 focus:w-64 xl:focus:w-80 transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {isFocused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in space-y-1 max-h-80 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-muted-light px-2 py-1">
            Kết Quả Tìm Kiếm ({results.length})
          </p>
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/watch/${m.episodes[0]?.id}`}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- catalog art comes from arbitrary hosts */}
              <img src={m.bannerUrl} alt={m.title} className="w-12 h-8 rounded object-cover shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-ruby transition-colors">
                  {m.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-muted-light">{m.genre.join(' • ')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
