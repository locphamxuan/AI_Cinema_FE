'use client';

import type { Episode, Movie } from '@/types/movie';

interface EpisodePlaylistProps {
  movie: Movie;
  currentEpisodeId: string;
  isPlaying: boolean;
  canPlay: (episode: Episode) => boolean;
  onSelect: (episode: Episode) => void;
}

function PlayingBars() {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="flex items-end gap-1 h-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-ruby rounded-full animate-pulse"
            style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** The episode list next to the player; a locked episode opens the unlock flow instead. */
export default function EpisodePlaylist({ movie, currentEpisodeId, isPlaying, canPlay, onSelect }: EpisodePlaylistProps) {
  return (
    <div className="w-full lg:w-88 shrink-0 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-700 dark:text-muted-light uppercase tracking-wider">
          Danh sách tập ({movie.totalEpisodes} tập)
        </h3>
        <span className="text-xs text-neon font-mono font-semibold">HLS Audio Synced</span>
      </div>

      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
        {movie.episodes.map((ep) => {
          const isActive = currentEpisodeId === ep.id;
          const playable = canPlay(ep);

          return (
            <button
              key={ep.id}
              onClick={() => onSelect(ep)}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                isActive
                  ? 'bg-white dark:bg-ruby/[0.08] border-ruby/60 shadow-lg shadow-ruby/15 ring-1 ring-ruby/30'
                  : 'bg-white dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm'
              }`}
            >
              <div className="relative w-28 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-[#161922] border border-slate-200 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails come from arbitrary hosts */}
                <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
                {!playable && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-base">🔒</span>
                  </div>
                )}
                {isActive && isPlaying && <PlayingBars />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isActive ? 'text-ruby' : 'text-slate-500 dark:text-muted-light'}`}>
                    Tập {ep.episodeNumber}
                  </span>
                  {ep.isFree && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-verified/20 border border-verified/30 text-verified font-bold">
                      FREE
                    </span>
                  )}
                  {ep.versions && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-muted-light font-mono">
                      {ep.currentVersion || 'v1.0'}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm truncate font-semibold mt-0.5 ${
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-muted-light'
                  }`}
                >
                  {ep.title}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted font-mono">{ep.duration}</span>
                  {!playable && !ep.isFree && <span className="text-[11px] text-coin font-bold">🪙 {ep.price} Coin</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
