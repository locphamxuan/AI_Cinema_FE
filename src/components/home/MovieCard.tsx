'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[240px] transition-all duration-300 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${movie.episodes[0]?.id || 'ep-001'}`} className="block">
        {/* Main Card Container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#161922] border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-ruby/50 group-hover:shadow-2xl group-hover:shadow-ruby/20 group-hover:z-30">
          {/* Poster Image */}
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Top Badge (if any) */}
          {movie.badge && (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-ruby/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md">
              {movie.badge}
            </div>
          )}

          {/* AI Compliance Micro-Tag */}
          <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-[9px] text-white/90 font-medium backdrop-blur-md">
            AI • Đ.44
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Card Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end">
            {/* Match Score & Specs */}
            <div className="flex items-center gap-1.5 mb-1 text-[10px]">
              <span className="text-verified font-bold">
                {movie.matchScore || 98}% Phù hợp
              </span>
              <span className="quality-badge">{movie.ageRating || 'T16'}</span>
              <span className="quality-badge">{movie.quality || '4K'}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-ruby transition-colors">
              {movie.title}
            </h3>

            {/* Genre list */}
            <p className="text-[11px] text-muted-light line-clamp-1 mt-0.5">
              {movie.genre.join(' • ')}
            </p>

            {/* Quick Action Bar (Revealed on Hover) */}
            <div
              className={`flex items-center gap-2 mt-2 pt-2 border-t border-white/10 transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs hover:bg-ruby hover:text-white transition-all shadow-md active:scale-95"
                title="Xem ngay"
              >
                ▶
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddedToList(!isAddedToList);
                }}
                className={`w-7 h-7 rounded-full border border-white/30 flex items-center justify-center text-xs transition-all backdrop-blur-md ${
                  isAddedToList
                    ? 'bg-verified/20 border-verified text-verified'
                    : 'bg-black/40 hover:bg-white/20 text-white'
                }`}
                title={isAddedToList ? 'Đã thêm vào danh sách' : 'Thêm vào danh sách'}
              >
                {isAddedToList ? '✓' : '+'}
              </button>

              <span className="text-[10px] text-muted ml-auto font-mono">
                {movie.totalEpisodes} tập
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
