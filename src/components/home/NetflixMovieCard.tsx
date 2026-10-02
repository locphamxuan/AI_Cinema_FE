'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Plus, Check, Heart, ChevronDown,  ShieldCheck } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface NetflixMovieCardProps {
  movie: Movie;
  onOpenDetail: (movie: Movie) => void;
  aspectRatio?: '2/3' | '16/9';
}

export default function NetflixMovieCard({ movie, onOpenDetail, aspectRatio = '16/9' }: NetflixMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const displayImage = aspectRatio === '16/9' ? (movie.bannerUrl || movie.posterUrl) : movie.posterUrl;
  const firstEpisode = movie.episodes?.[0];

  const episodeBadgeText = movie.totalEpisodes > 1
    ? `Tập ${movie.episodes.length}/${movie.totalEpisodes || movie.episodes.length} Vietsub`
    : 'Bản Đầy Đủ Vietsub';

  return (
    <div
      className={`group relative flex-shrink-0 transition-all duration-300 ease-out z-10 hover:z-30 ${
        aspectRatio === '16/9'
          ? 'w-[270px] sm:w-[330px] md:w-[370px]'
          : 'w-[185px] sm:w-[215px] md:w-[235px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card Frame */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-[#8B5CF6] group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.85)] shadow-sm dark:shadow-md">
        {/* Poster / Thumbnail Image */}
        <div className={aspectRatio === '16/9' ? 'aspect-[16/9] relative overflow-hidden bg-black' : 'aspect-[2/3] relative overflow-hidden bg-black'}>
          <img
            src={displayImage}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Motchill-style Episode Badge (Top Left) */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-[10px] font-bold text-amber-300 backdrop-blur-md shadow-md">
            <span>{episodeBadgeText}</span>
          </div>

          {/* Badge: Compliance Đ.44 (Top Right) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/30 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span>Đ.44</span>
          </div>

          {/* Bottom Left Quality / AI Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow">
              {movie.quality || '4K'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-slate-300 font-semibold text-[9px] backdrop-blur-md">
              AI Cinema
            </span>
          </div>

          {/* Center Play Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35 backdrop-blur-[2px]">
            <Link
              href={firstEpisode ? `/watch/${firstEpisode.id}` : '#'}
              className="w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
              title="Phát phim ngay"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            </Link>
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        </div>

        {/* Info Container */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
              {movie.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-semibold text-[10px]">
              {movie.ageRating}
            </span>
            <span>{movie.year}</span>
          </div>

          {/* Genre list tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {movie.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Hover Quick Action Buttons */}
          <div
            className={`flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 transition-all duration-200 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link
                href={firstEpisode ? `/watch/${firstEpisode.id}` : '#'}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md shadow-red-600/30"
                title="Xem ngay"
              >
                <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAdded(!isAdded);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all ${
                  isAdded
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border-slate-200 dark:border-white/20 text-slate-700 dark:text-white'
                }`}
                title={isAdded ? 'Đã thêm vào danh sách' : 'Thêm vào danh sách của tôi'}
              >
                {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all ${
                  isLiked
                    ? 'bg-red-500/20 border-red-500 text-red-500'
                    : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border-slate-200 dark:border-white/20 text-slate-700 dark:text-white'
                }`}
                title={isLiked ? 'Đã thích' : 'Thích phim này'}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Expand Details Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenDetail(movie);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-all hover:scale-110"
              title="Xem chi tiết & kịch bản"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
