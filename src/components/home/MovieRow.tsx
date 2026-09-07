'use client';

import { useRef } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import Link from 'next/link';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  icon?: string;
  movies: Movie[];
  exploreHref?: string;
}

export default function MovieRow({
  title,
  subtitle,
  icon = '🎬',
  movies,
  exploreHref = '/watch/ep-001',
}: MovieRowProps) {
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

  return (
    <div className="relative group/row space-y-3">
      {/* Row Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 group-hover/row:text-ruby transition-colors">
            <span>{icon}</span>
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-xs text-muted-light mt-0.5">{subtitle}</p>}
        </div>

        <Link
          href={exploreHref}
          className="text-xs font-semibold text-neon hover:text-white transition-colors flex items-center gap-1 group/link"
        >
          <span>Xem tất cả</span>
          <span className="transition-transform group-hover/link:translate-x-1">›</span>
        </Link>
      </div>

      {/* Row Container with Scroll Buttons */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-24 bg-black/60 hover:bg-black/90 text-white rounded-r-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-r border-white/10 hover:border-ruby shadow-xl"
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-24 bg-black/60 hover:bg-black/90 text-white rounded-l-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center border-y border-l border-white/10 hover:border-ruby shadow-xl"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
