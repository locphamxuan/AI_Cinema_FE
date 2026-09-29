'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
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

  return (
    <div className="relative group/top10 space-y-4 my-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 md:px-12">
        <div className="w-2.5 h-6 rounded-full bg-[#E50914]" />
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Top 10 Phim AI Thịnh Hành Hôm Nay</span>
          <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
            Cập nhật liên tục
          </span>
        </h2>
      </div>

      {/* Row Track */}
      <div className="relative px-4 sm:px-8 md:px-12">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-32 bg-black/70 hover:bg-black/95 text-white rounded-r-2xl opacity-0 group-hover/top10:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-r border-white/10 hover:border-red-600 shadow-2xl cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 px-2 scroll-smooth"
        >
          {topMovies.map((movie, index) => {
            const rank = index + 1;
            return (
              <div
                key={movie.id}
                className="group/card relative flex items-center flex-shrink-0 cursor-pointer select-none transition-transform duration-300 hover:scale-105"
                onClick={() => onOpenDetail(movie)}
              >
                {/* Giant Stylized Rank Number (Netflix Outline Typography) */}
                <div className="relative z-0 select-none pointer-events-none -mr-4 sm:-mr-8">
                  <span
                    className="font-black text-[100px] sm:text-[140px] md:text-[160px] leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: '4px #334155',
                      color: '#0A0C10',
                      textShadow: '0 0 20px rgba(0,0,0,0.8)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-[140px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151E] border border-white/10 group-hover/card:border-[#E50914] group-hover/card:shadow-[0_10px_30px_rgba(229,9,20,0.3)] transition-all shadow-xl">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[9px] font-black uppercase">
                      #{rank}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white text-[9px] font-medium backdrop-blur-md">
                      AI • Đ.44
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-2.5 inset-x-2.5 z-10">
                    <p className="text-xs font-bold text-white line-clamp-1 group-hover/card:text-[#E50914] transition-colors">
                      {movie.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                      <span className="text-emerald-400 font-bold">{movie.matchScore || 98}%</span>
                      <span>{movie.quality || '4K'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-32 bg-black/70 hover:bg-black/95 text-white rounded-l-2xl opacity-0 group-hover/top10:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-l border-white/10 hover:border-red-600 shadow-2xl cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
