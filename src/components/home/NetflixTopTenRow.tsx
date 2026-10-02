'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Sparkles, Star, ShieldCheck } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface NetflixTopTenRowProps {
  movies: Movie[];
  onOpenDetail: (movie: Movie) => void;
}

export default function NetflixTopTenRow({ movies, onOpenDetail }: NetflixTopTenRowProps) {
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

  const topMovies = movies.slice(0, 10);
  if (topMovies.length === 0) return null;

  return (
    <div className="relative group/top10 space-y-4 my-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 md:px-14">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#E50914] to-red-800 shadow-md shadow-red-600/40" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Top 10 Phim AI Thịnh Hành Hôm Nay</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              Phổ Biến Nhất
            </span>
          </h2>
        </div>
      </div>

      {/* Row Track */}
      <div className="relative px-4 sm:px-8 md:px-14">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-36 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-slate-900 dark:text-white rounded-r-2xl opacity-0 group-hover/top10:opacity-100 transition-all duration-300 backdrop-blur-xl flex items-center justify-center border-y border-r border-slate-200 dark:border-white/15 hover:border-red-600 shadow-xl cursor-pointer hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-7 overflow-x-auto no-scrollbar py-6 px-2 scroll-smooth"
        >
          {topMovies.map((movie, index) => {
            const rank = index + 1;
            return (
              <div
                key={movie.id}
                className="group/card relative flex items-center flex-shrink-0 cursor-pointer select-none transition-transform duration-300 hover:scale-105 hover:z-30"
                onClick={() => onOpenDetail(movie)}
              >
                {/* Giant Stylized Rank Number (Netflix Metallic Typography) */}
                <div className="relative z-0 select-none pointer-events-none -mr-4 sm:-mr-8">
                  <span
                    className="font-black text-[110px] sm:text-[150px] md:text-[180px] leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: '4px rgba(100, 116, 139, 0.35)',
                      color: 'transparent',
                      textShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-[145px] sm:w-[175px] md:w-[200px] aspect-[2/3] rounded-2xl overflow-hidden bg-white dark:bg-[#12151E] border border-slate-200 dark:border-white/10 group-hover/card:border-[#E50914] group-hover/card:shadow-[0_12px_36px_rgba(229,9,20,0.35)] transition-all duration-300 shadow-sm dark:shadow-xl">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover/card:opacity-75 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-md bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-red-600/50">
                      TOP {rank}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-emerald-300 text-[9px] font-bold backdrop-blur-md">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      Đ.44
                    </span>
                  </div>

                  {/* Hover Quick Play Icon Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 inset-x-3 z-10">
                    <p className="text-xs font-bold text-white line-clamp-1 group-hover/card:text-[#E50914] transition-colors drop-shadow">
                      {movie.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                      <span className="text-emerald-400 font-bold">{movie.matchScore || 98}% Match</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {movie.rating || 9.0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-36 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-slate-900 dark:text-white rounded-l-2xl opacity-0 group-hover/top10:opacity-100 transition-all duration-300 backdrop-blur-xl flex items-center justify-center border-y border-l border-slate-200 dark:border-white/15 hover:border-red-600 shadow-xl cursor-pointer hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
