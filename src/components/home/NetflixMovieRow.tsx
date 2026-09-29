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
      <div className="flex items-end justify-between px-4 sm:px-8 md:px-12">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>{title}</span>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6]">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              — {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Carousel Container with Scroll Chevron Overlays */}
      <div className="relative px-4 sm:px-8 md:px-12">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-28 bg-black/70 hover:bg-black/95 text-white rounded-r-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-r border-white/10 hover:border-[#8B5CF6] shadow-2xl cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Cards Track */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth"
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

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-28 bg-black/70 hover:bg-black/95 text-white rounded-l-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-l border-white/10 hover:border-[#8B5CF6] shadow-2xl cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
