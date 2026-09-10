'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface HeroBannerProps {
  movie: Movie;
  isVIPMode: boolean;
}

export default function HeroBanner({ movie, isVIPMode }: HeroBannerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900 group">
      {/* Ambient Aura Lighting Behind Banner */}
      <div className="absolute -inset-4 ambient-glow-ruby -z-10 pointer-events-none opacity-40" />

      {/* Background Image with Layered Vignettes */}
      <div className="relative h-[420px] sm:h-[500px] md:h-[560px] w-full overflow-hidden">
        <img
          src={movie.bannerUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
        />

        {/* Multi-gradient Vignettes for true cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/70" />
      </div>

      {/* Main Banner Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
        {/* Badges & Meta Specs */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md bg-ruby text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg shadow-ruby/30">
            {movie.badge || 'Đề Xuất Số 1'}
          </span>

          <span className="px-2 py-0.5 rounded bg-verified/25 border border-verified/40 text-emerald-300 text-xs font-bold">
            {movie.matchScore || 99}% Match
          </span>

          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md">
            {movie.ageRating || 'T16'}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md">
            {movie.quality || '4K Ultra HD'}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md">
            {movie.audioQuality || 'Dolby Atmos'}
          </span>

          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/25 text-white/95 text-xs font-semibold backdrop-blur-md">
            100% AI • Điều 44
          </span>

          {isVIPMode && (
            <span className="px-2 py-0.5 rounded bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold">
              Quyền VIP
            </span>
          )}
        </div>

        {/* Cinematic Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Genre Tags */}
        <p className="text-xs sm:text-sm text-purple-300 font-semibold mb-3">
          {movie.genre.join(' • ')}
        </p>

        {/* Synopsis */}
        <p className="text-slate-200 text-xs sm:text-sm md:text-base line-clamp-3 mb-6 max-w-xl leading-relaxed">
          {movie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/watch/${movie.episodes[0]?.id || 'ep-001'}`}
            className="btn-shimmer px-7 py-3.5 bg-ruby hover:bg-ruby-dark text-white rounded-xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-ruby/30 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-lg">▶</span>
            <span>Xem Tập 1 (4K HDR)</span>
          </Link>

          <button
            onClick={() => setIsAdded(!isAdded)}
            className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-white/25 backdrop-blur-md shadow-sm"
          >
            <span>{isAdded ? '✓' : '+'}</span>
            <span>{isAdded ? 'Đã thêm' : 'Danh sách của tôi'}</span>
          </button>

          <Link
            href="/profile/subscription"
            className="px-4 py-3.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all border border-amber-400/40 backdrop-blur-md shadow-sm"
          >
            <span>👑</span>
            <span className="hidden sm:inline">Gói VIP</span>
          </Link>
        </div>
      </div>

      {/* Sound / Mute Toggle Button at Bottom Right */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-6 right-6 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
        title={isMuted ? 'Bật âm thanh preview' : 'Tắt âm thanh'}
      >
        <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
      </button>
    </div>
  );
}
