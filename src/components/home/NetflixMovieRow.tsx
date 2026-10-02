'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';
import NetflixMovieCard from './NetflixMovieCard';

interface NetflixMovieRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  movies: Movie[];
  onOpenDetail: (movie: Movie) => void;
  aspectRatio?: '2/3' | '16/9';
}

export default function NetflixMovieRow({
  title,
  subtitle,
  badge,
  movies,
  onOpenDetail,
  aspectRatio = '16/9',
}: NetflixMovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group/row space-y-3.5 my-8">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-8 md:px-14">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#8B5CF6] to-purple-800 shadow-md shadow-purple-600/40" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{title}</span>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 text-[#8B5CF6] shadow-sm">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
              — {subtitle}
            </span>
          )}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">
          {movies.length} tác phẩm
        </span>
      </div>

      {/* Row Track with Navigation Controls */}
      <div className="relative px-4 sm:px-8 md:px-14">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-36 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-slate-900 dark:text-white rounded-r-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-xl flex items-center justify-center border-y border-r border-slate-200 dark:border-white/15 hover:border-purple-500 shadow-xl cursor-pointer hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Horizontal Slider */}
        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 px-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <NetflixMovieCard
              key={movie.id}
              movie={movie}
              onOpenDetail={onOpenDetail}
              aspectRatio={aspectRatio}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-36 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-slate-900 dark:text-white rounded-l-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-xl flex items-center justify-center border-y border-l border-slate-200 dark:border-white/15 hover:border-purple-500 shadow-xl cursor-pointer hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
