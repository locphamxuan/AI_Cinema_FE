'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface HeroBannerProps {
  movies?: Movie[];
  movie?: Movie;
  isVIPMode?: boolean;
}

export default function HeroBanner({ movies, movie, isVIPMode = false }: HeroBannerProps) {
  // Determine movies list (up to 5 hot movies)
  const movieList = movies && movies.length > 0 ? movies.slice(0, 5) : movie ? [movie] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [myListMap, setMyListMap] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play timer for hero carousel (5 seconds)
  useEffect(() => {
    if (isHovered || movieList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movieList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, movieList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movieList.length) % movieList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movieList.length);
  };

  const currentMovie = movieList[currentIndex] || movieList[0];
  if (!currentMovie) return null;
  const isAdded = !!myListMap[currentMovie.id];

  const toggleMyList = (id: string) => {
    setMyListMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950 group select-none transition-colors"
    >
      {/* Ambient Aura Lighting Behind Banner */}
      <div className="absolute -inset-4 ambient-glow-ruby -z-10 pointer-events-none opacity-50" />

      {/* Background Image Slides Carousel */}
      <div className="relative h-[440px] sm:h-[520px] md:h-[600px] w-full overflow-hidden">
        {movieList.map((m, idx) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
            } transition-transform duration-1000`}
          >
            <img
              src={m.bannerUrl}
              alt={m.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Multi-gradient Vignettes for authentic cinema feel */}
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 z-15 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent w-full md:w-4/5" />
        <div className="absolute inset-0 z-15 bg-radial from-transparent via-transparent to-slate-950/70" />
      </div>

      {/* Carousel Navigation Arrows (Left & Right) */}
      {movieList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Phim trước"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            aria-label="Phim tiếp theo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Main Banner Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
        {/* Badges & Meta Specs */}
        <div className="flex flex-wrap items-center gap-2 mb-3 animate-fade-in key={currentMovie.id + '-badge'}">
          {/* TOP 10 Tag */}
          <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1">
            <span>TOP 10</span>
          </span>

          <span className="text-white/80 text-xs font-semibold px-1">
            {currentMovie.year} | {currentIndex % 2 === 0 ? 'Âu Mỹ' : 'Việt Nam AI'} | Hoàn tất
          </span>

          <span className="px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {currentMovie.matchScore || 99}% Match
          </span>

          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md">
            {currentMovie.ageRating || 'T16'}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md hidden sm:inline-block">
            {currentMovie.quality || '4K Ultra HD'}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-md hidden sm:inline-block">
            {currentMovie.audioQuality || 'Dolby Atmos'}
          </span>

          {isVIPMode && (
            <span className="px-2 py-0.5 rounded bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold">
              Quyền VIP
            </span>
          )}
        </div>

        {/* Title Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-2xl animate-slide-up key={currentMovie.id + '-title'}">
          {currentMovie.title}
        </h1>

        {/* Genre Tags (Pill Style like image) */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {currentMovie.genre.map((g) => (
            <span
              key={g}
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs sm:text-sm font-semibold backdrop-blur-md transition-colors"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Synopsis / Description */}
        <p className="text-slate-200 text-xs sm:text-sm md:text-base line-clamp-3 mb-6 max-w-xl leading-relaxed drop-shadow">
          {currentMovie.description}
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Xem Ngay Button (Emerald Green like in ONFLIX reference image, retaining option for ruby theme) */}
          <Link
            href={`/watch/${currentMovie.episodes[0]?.id}`}
            className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-full text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-lg">▶</span>
            <span>Xem Ngay</span>
          </Link>

          {/* Mute Sound Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer active:scale-95 shadow-md"
            title={isMuted ? 'Bật âm thanh preview' : 'Tắt âm thanh'}
          >
            <span className="text-base">{isMuted ? '🔇' : '🔊'}</span>
          </button>

          {/* My List Bookmark Button */}
          <button
            onClick={() => toggleMyList(currentMovie.id)}
            className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white rounded-full font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-white/25 backdrop-blur-md shadow-sm"
          >
            <span>{isAdded ? '✓' : '+'}</span>
            <span>{isAdded ? 'Đã thêm' : 'Danh sách của tôi'}</span>
          </button>
        </div>
      </div>

      {/* Carousel Pagination Dots (Bottom Right) */}
      {movieList.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-30 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-xl">
          {movieList.map((m, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Chuyển đến phim ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 h-2.5 bg-emerald-400 shadow-md shadow-emerald-400/50'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
