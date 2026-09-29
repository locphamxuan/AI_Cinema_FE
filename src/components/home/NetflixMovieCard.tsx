'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Plus, Check, Heart, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
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

  return (
    <div
      className={`group relative flex-shrink-0 transition-all duration-300 ease-out z-10 hover:z-30 ${
        aspectRatio === '16/9'
          ? 'w-[260px] sm:w-[320px] md:w-[360px]'
          : 'w-[180px] sm:w-[210px] md:w-[230px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card Frame */}
      <div className="relative rounded-2xl overflow-hidden bg-[#12151E] border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-[#8B5CF6]/50 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] shadow-md">
        {/* Poster / Thumbnail Image */}
        <div className={aspectRatio === '16/9' ? 'aspect-[16/9] relative overflow-hidden' : 'aspect-[2/3] relative overflow-hidden'}>
          <img
            src={displayImage}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Badge: AI Content */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 border border-white/20 text-[10px] font-bold text-white backdrop-blur-md">
            <Sparkles className="w-2.5 h-2.5 text-[#8B5CF6]" />
            <span>AI Content</span>
          </div>

          {/* Badge: Compliance Đ.44 */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span>Đ.44</span>
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12151E] via-transparent to-transparent opacity-90" />
        </div>

        {/* Info Container */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#E50914] transition-colors">
              {movie.title}
            </h3>
            <span className="text-[10px] font-black text-amber-400 shrink-0">
              ★ {movie.rating || 9.0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
            <span className="text-emerald-400 font-bold">{movie.matchScore || 98}% Match</span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-semibold text-[10px]">
              {movie.ageRating || 'T16'}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-semibold text-[10px]">
              {movie.quality || '4K'}
            </span>
            <span>{movie.totalEpisodes > 1 ? `${movie.totalEpisodes} Tập` : 'Phim lẻ'}</span>
          </div>

          {/* Genre list tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {movie.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] text-slate-300 px-2 py-0.5 rounded-md bg-white/5 border border-white/5"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Hover Quick Action Buttons */}
          <div
            className={`flex items-center justify-between pt-2 border-t border-white/10 transition-all duration-200 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link
                href={`/watch/${movie.episodes[0]?.id}`}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md"
                title="Xem ngay"
              >
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAdded(!isAdded);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all ${
                  isAdded
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : 'bg-white/10 hover:bg-white/25 border-white/20 text-white'
                }`}
                title={isAdded ? 'Đã thêm vào danh sách' : 'Thêm vào danh sách của tôi'}
              >
                {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all ${
                  isLiked
                    ? 'bg-red-500/25 border-red-400 text-red-400'
                    : 'bg-white/10 hover:bg-white/25 border-white/20 text-white'
                }`}
                title={isLiked ? 'Đã thích' : 'Thích phim này'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400' : ''}`} />
              </button>
            </div>

            {/* Expand Details Trigger */}
            <button
              type="button"
              onClick={() => onOpenDetail(movie)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
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
