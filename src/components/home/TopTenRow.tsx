'use client';

import Link from 'next/link';
import { Movie } from '@/types/movie';

interface TopTenRowProps {
  movies: Movie[];
}

export default function TopTenRow({ movies }: TopTenRowProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-xl">🏆</span>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Top 5 Phim AI Thịnh Hành Hôm Nay
        </h2>
      </div>

      <div className="flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
        {movies.slice(0, 5).map((movie, index) => {
          const rank = index + 1;

          return (
            <Link
              key={movie.id}
              href={`/watch/${movie.episodes[0]?.id || 'ep-001'}`}
              className="group relative flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
            >
              {/* Giant Rank Number */}
              <div className="relative z-0 select-none pointer-events-none -mr-4 sm:-mr-8">
                <span className="top-10-rank-number font-black transition-all group-hover:drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                  {rank}
                </span>
              </div>

              {/* Poster Card */}
              <div className="relative z-10 w-[130px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 group-hover:border-ruby/60 group-hover:shadow-2xl group-hover:shadow-ruby/20 transition-all shadow-sm">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                <div className="absolute bottom-2 left-2 right-2">
                  <span className="quality-badge text-[9px] mb-1">
                    {movie.matchScore}% Match
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-ruby transition-colors">
                    {movie.title}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
