'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Info, Plus, Check, Volume2, VolumeX, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface CinematicHeroBillboardProps {
  movie: Movie;
  onOpenDetailModal: (movie: Movie) => void;
}

export default function CinematicHeroBillboard({ movie, onOpenDetailModal }: CinematicHeroBillboardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  if (!movie) return null;

  return (
    <div className="relative w-full h-[75vh] min-h-[580px] max-h-[820px] overflow-hidden select-none bg-[#0A0C10]">
      {/* Background Image / Video Backdrop */}
      <div className="absolute inset-0">
        <img
          src={movie.bannerUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-100 animate-fade-in"
        />

        {/* Ambient Dark Cinema Gradients */}
        {/* Bottom fade into carousel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
        {/* Left vignette for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/80 to-transparent w-full md:w-3/4" />
        {/* Top gradient shadow for navbar */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Main Content Overlaid */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-16 pb-16 sm:pb-24 max-w-4xl z-20">
        {/* Feature Tags & Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3.5 animate-slide-up">
          {/* AI Masterpiece Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-red-600/40">
            <Sparkles className="w-3 h-3 text-amber-300" />
            AI Masterpiece
          </span>

          {/* 4K HDR Badge */}
          <span className="px-2.5 py-0.5 rounded-md bg-white/15 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
            4K HDR
          </span>

          {/* Dieu 44 Compliance Verified */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Điều 44 Verified
          </span>

          {/* IMDb / Rating Score */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {movie.rating || 9.4}/10 IMDb
          </span>

          <span className="text-slate-400 text-xs font-medium">
            {movie.year} · Mùa 1 · 3 Tập
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          {movie.title}
        </h1>

        {/* Genre Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          {movie.genre.map((g) => (
            <span
              key={g}
              className="text-xs text-slate-300 font-medium px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
            >
              {g}
            </span>
          ))}
          {movie.partnerStudio && (
            <span className="text-xs text-purple-300 font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
              Studio: {movie.partnerStudio}
            </span>
          )}
        </div>

        {/* Description / Synopsis */}
        <p className="text-slate-300 text-sm sm:text-base line-clamp-3 mb-6 max-w-2xl leading-relaxed drop-shadow">
          {movie.description}
        </p>

        {/* Primary Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Phát tập 1 / Xem Ngay */}
          <Link
            href={`/watch/${movie.episodes[0]?.id}`}
            className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-black font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Phát Tập 1 (Miễn Phí)</span>
          </Link>

          {/* Chi Tiết & Kịch Bản (Mở Modal) */}
          <button
            type="button"
            onClick={() => onOpenDetailModal(movie)}
            className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-all backdrop-blur-md active:scale-95 cursor-pointer border border-white/20"
          >
            <Info className="w-5 h-5" />
            <span>Chi Tiết & Kịch Bản</span>
          </button>

          {/* Thêm Vào Danh Sách */}
          <button
            type="button"
            onClick={() => setIsAdded(!isAdded)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all backdrop-blur-md active:scale-95 cursor-pointer border ${
              isAdded
                ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
            }`}
            title={isAdded ? 'Đã thêm vào danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sound Mute Toggle Button (Bottom Right) */}
      <div className="absolute bottom-16 sm:bottom-24 right-4 sm:right-10 z-30">
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          title={isMuted ? 'Bật âm thanh trailer' : 'Tắt âm thanh trailer'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
