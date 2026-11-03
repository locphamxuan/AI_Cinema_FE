'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Play,  ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface ContinueWatchingRowProps {
  movies: Movie[];
  onOpenDetail: (movie: Movie) => void;
}

export default function ContinueWatchingRow({ movies, onOpenDetail }: ContinueWatchingRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const watchingList = movies.filter((m) => (m.continueProgress ?? 0) > 0);
  if (watchingList.length === 0) return null;

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

  return (
    <div className="relative group/continue space-y-4 my-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 md:px-14">
        <div className="w-2.5 h-6 rounded-full bg-[#8B5CF6]" />
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Xem Tiếp Của Bạn</span>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            Tiếp tục phát
          </span>
        </h2>
      </div>

      <div className="relative px-4 sm:px-8 md:px-14">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-28 bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/95 text-slate-900 dark:text-white rounded-r-2xl opacity-0 group-hover/continue:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-r border-slate-200 dark:border-white/10 hover:border-[#8B5CF6] shadow-xl cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {watchingList.map((movie) => {
            const progress = movie.continueProgress || 50;
            const episode = movie.episodes.find((ep) => ep.episodeNumber === movie.continueEpisodeNumber) || movie.episodes[0];

            return (
              <div
                key={movie.id}
                className="group/card relative flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] rounded-2xl overflow-hidden bg-white dark:bg-[#12151E] border border-slate-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-xl dark:hover:shadow-purple-600/20 transition-all duration-300"
              >
                {/* Thumbnail Header with Play Button */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <img
                    src={movie.bannerUrl || movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Big Central Play Button */}
                  <Link
                    href={`/watch/${episode.id}`}
                    className="absolute inset-0 flex items-center justify-center"
                    title="Tiếp tục phát"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/95 group-hover/card:bg-[#E50914] text-black group-hover/card:text-white flex items-center justify-center transition-all group-hover/card:scale-110 shadow-2xl">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </Link>

                  {/* Progress Bar Overlaid on Bottom of Video */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-[#E50914] shadow-[0_0_10px_#E50914] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{movie.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {episode.title} · Tiến độ {progress}%
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetail(movie)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Thông tin chi tiết"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-28 bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/95 text-slate-900 dark:text-white rounded-l-2xl opacity-0 group-hover/continue:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-l border-slate-200 dark:border-white/10 hover:border-[#8B5CF6] shadow-xl cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
