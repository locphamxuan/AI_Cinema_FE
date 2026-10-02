'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, Plus, Check, Volume2, VolumeX, ShieldCheck, Sparkles, Star, Film, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';

interface CinematicHeroBillboardProps {
  movie: Movie;
  featuredMovies?: Movie[];
  onSelectMovie?: (movie: Movie) => void;
  onOpenDetailModal: (movie: Movie) => void;
}

export default function CinematicHeroBillboard({
  movie,
  featuredMovies = [],
  onSelectMovie,
  onOpenDetailModal,
}: CinematicHeroBillboardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setIsAdded(false);
  }, [movie.id]);

  const toggleSound = () => {
    setIsMuted(!isMuted);
    setIsPlayingAudio(isMuted);
  };

  if (!movie) return null;

  const displayBanner = movie.bannerUrl || movie.posterUrl;
  const firstEpisode = movie.episodes?.[0];

  return (
    <div className="relative w-full h-[80vh] min-h-[640px] max-h-[860px] overflow-hidden select-none bg-[#07090E]">
      {/* Background Image with Smooth Ambient Dark Gradients */}
      <div className="absolute inset-0">
        <img
          key={movie.id}
          src={displayBanner}
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-100 animate-fade-in transition-all duration-1000"
        />

        {/* Ambient Dark Cinema Gradients - Multiple Layers for Depth */}
        {/* Bottom fade: deep black merging into rows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 via-40% to-transparent" />
        {/* Left vignette: dramatic side shading for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/85 via-45% to-transparent w-full lg:w-4/5" />
        {/* Top gradient shadow for floating navbar */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        {/* Subtle radial center glow */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
      </div>

      {/* Main Content Overlaid */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-16 pb-20 sm:pb-28 max-w-4xl z-20">
        {/* Feature Tags & Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4 animate-slide-up">
          {/* AI Masterpiece Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-red-600/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Masterpiece
          </span>

          {/* 4K Ultra HDR */}
          <span className="px-2.5 py-0.5 rounded-md bg-white/15 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
            4K ULTRA HDR
          </span>

          {/* Dieu 44 Compliance Verified */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Điều 44 Verified
          </span>

          {/* IMDb / Rating Score */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {movie.rating || 9.4} / 10
          </span>

          {/* Season & Year */}
          <span className="text-slate-300/80 text-xs font-medium hidden sm:inline">
            {movie.year || 2026} · {movie.totalEpisodes > 1 ? `Mùa 1 · ${movie.totalEpisodes} Tập` : 'Phim Điện Ảnh'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-3.5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] max-w-3xl">
          {movie.title}
        </h1>

        {/* Studio Partner & Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {movie.partnerStudio && (
            <span className="inline-flex items-center gap-1.5 text-xs text-purple-300 font-semibold px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 backdrop-blur-md">
              <Film className="w-3 h-3 text-purple-400" />
              Studio: {movie.partnerStudio}
            </span>
          )}
          {movie.genre.map((g) => (
            <span
              key={g}
              className="text-xs text-slate-300 font-medium px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Description / Synopsis */}
        <p className="text-slate-200/90 text-sm sm:text-base line-clamp-3 mb-7 max-w-2xl leading-relaxed drop-shadow-md font-normal">
          {movie.description}
        </p>

        {/* Primary Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Phát tập 1 / Xem Ngay */}
          <Link
            href={firstEpisode ? `/watch/${firstEpisode.id}` : '#'}
            className="group/btn px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-black font-black text-sm sm:text-base flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-white/15 cursor-pointer relative overflow-hidden"
          >
            <Play className="w-5 h-5 fill-black group-hover/btn:scale-110 transition-transform" />
            <span>Phát Tập 1 (Miễn Phí)</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </Link>

          {/* Chi Tiết & Kịch Bản (Mở Modal) */}
          <button
            type="button"
            onClick={() => onOpenDetailModal(movie)}
            className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all duration-200 backdrop-blur-xl active:scale-95 cursor-pointer border border-white/20 hover:border-white/30 shadow-lg"
          >
            <Info className="w-5 h-5 text-slate-200" />
            <span>Chi Tiết & Kịch Bản</span>
          </button>

          {/* Thêm Vào Danh Sách */}
          <button
            type="button"
            onClick={() => setIsAdded(!isAdded)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-xl active:scale-95 cursor-pointer border ${
              isAdded
                ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-white/15 hover:bg-white/25 border-white/20 text-white hover:border-white/30'
            }`}
            title={isAdded ? 'Đã thêm vào danh sách' : 'Thêm vào danh sách yêu thích'}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Right Spotlight Film Switcher & Mute Controls */}
      <div className="absolute bottom-16 sm:bottom-24 right-4 sm:right-12 z-30 flex flex-col items-end gap-3.5">
        {/* Spotlight Carousel Selector (When multiple featured movies exist) */}
        {featuredMovies.length > 1 && onSelectMovie && (
          <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl shadow-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Tiêu điểm:
            </span>
            <div className="flex items-center gap-1.5">
              {featuredMovies.slice(0, 4).map((fMovie, index) => {
                const isActive = fMovie.id === movie.id;
                return (
                  <button
                    key={fMovie.id}
                    onClick={() => onSelectMovie(fMovie)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-24 h-12 ring-2 ring-[#E50914] scale-105 shadow-lg shadow-red-600/30'
                        : 'w-16 h-12 opacity-60 hover:opacity-100 hover:w-20'
                    }`}
                    title={fMovie.title}
                  >
                    <img
                      src={fMovie.posterUrl || fMovie.bannerUrl}
                      alt={fMovie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate max-w-full">
                        #{index + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Mute & Sound Wave Indicator */}
        <div className="flex items-center gap-3">
          {isPlayingAudio && !isMuted && (
            <div className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[11px] text-slate-300">
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-red-400 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-red-600 rounded-full animate-pulse delay-150" />
              <span className="ml-1 text-[10px] font-mono text-white">Trailer Audio</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleSound}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            title={isMuted ? 'Bật âm thanh trailer' : 'Tắt âm thanh trailer'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-red-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
