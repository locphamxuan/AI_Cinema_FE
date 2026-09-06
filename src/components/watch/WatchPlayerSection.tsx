'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Episode } from '@/types/movie';
import ComplianceDrawer from './ComplianceDrawer';
import Hls from 'hls.js';

interface WatchPlayerSectionProps {
  episodeId?: string;
}

export default function WatchPlayerSection({ episodeId }: WatchPlayerSectionProps) {
  const { currentMovie, isVIPMode, openUnlockModal, wallet } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [showComplianceDrawer, setShowComplianceDrawer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailerWarning, setShowTrailerWarning] = useState(false);

  // Determine current episode
  useEffect(() => {
    const ep = currentMovie.episodes.find((e) => e.id === episodeId) || currentMovie.episodes[0];
    setCurrentEpisode(ep);
  }, [episodeId, currentMovie.episodes]);

  // Can the user play this episode?
  const canPlay = currentEpisode
    ? isVIPMode || currentEpisode.isFree || currentEpisode.isUnlocked
    : false;

  // Setup HLS player
  useEffect(() => {
    if (!currentEpisode || !videoRef.current) return;

    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (canPlay) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(currentEpisode.hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentEpisode.hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
      }
    } else {
      // For locked episodes, load but limit to 30s preview
      if (currentEpisode.isPreview) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(currentEpisode.hlsUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode, canPlay]);

  // 30s trailer limit for locked content  
  useEffect(() => {
    if (!videoRef.current || canPlay) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video.currentTime >= 30) {
        video.pause();
        setShowTrailerWarning(true);
        if (currentEpisode) openUnlockModal(currentEpisode.id);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [canPlay, currentEpisode, openUnlockModal]);

  const handleEpisodeClick = (ep: Episode) => {
    const canPlayEp = isVIPMode || ep.isFree || ep.isUnlocked;
    if (canPlayEp) {
      setCurrentEpisode(ep);
      setShowTrailerWarning(false);
    } else {
      openUnlockModal(ep.id);
    }
  };

  if (!currentEpisode) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Video Player Area */}
      <div className="flex-1">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
          {/* Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!canPlay ? 'blur-sm' : ''}`}
            controls={canPlay}
            poster={currentEpisode.thumbnailUrl}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Locked Overlay */}
          {!canPlay && (
            <div className="absolute inset-0 video-blur-overlay flex flex-col items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Tập phim bị khóa</h3>
                <p className="text-muted-light mb-4 text-sm max-w-xs">
                  {currentEpisode.isPreview
                    ? 'Bạn chỉ được xem 30 giây đầu. Mở khóa để xem toàn bộ.'
                    : 'Mở khóa tập phim để thưởng thức nội dung đầy đủ.'}
                </p>
                <button
                  onClick={() => openUnlockModal(currentEpisode.id)}
                  className="px-6 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95"
                >
                  🪙 Mở khóa - {currentEpisode.price} Coins
                </button>
              </div>
            </div>
          )}

          {/* Compliance Label */}
          <button
            onClick={() => setShowComplianceDrawer(true)}
            className="absolute bottom-3 left-3 right-3 sm:left-3 sm:right-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] sm:text-xs text-muted-light hover:text-foreground hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
          >
            <span>🏷️</span>
            <span className="line-clamp-1">
              Nội dung được tạo 100% bằng Trí tuệ Nhân tạo (Tuân thủ Điều 44 Luật AI & Nghị định 142)
            </span>
          </button>
        </div>

        {/* Episode Info */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded bg-ruby/20 text-ruby text-xs font-bold">
              Tập {currentEpisode.episodeNumber}
            </span>
            {isVIPMode && (
              <span className="px-2 py-0.5 rounded bg-coin/20 text-coin text-xs font-bold">VIP</span>
            )}
            <span className="text-muted-light text-xs">{currentEpisode.duration}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentMovie.title} - {currentEpisode.title}
          </h1>
          <p className="text-muted-light text-sm mt-2">{currentEpisode.synopsis}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {currentMovie.genre.map((g) => (
              <span key={g} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-muted-light">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Compliance Drawer */}
        <ComplianceDrawer
          isOpen={showComplianceDrawer}
          onClose={() => setShowComplianceDrawer(false)}
          compliance={currentMovie.aiCompliance}
        />
      </div>

      {/* Episode List Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <h3 className="text-sm font-bold text-muted-light uppercase tracking-wider mb-3">
          Danh sách tập ({currentMovie.totalEpisodes} tập)
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {currentMovie.episodes.map((ep) => {
            const isActive = currentEpisode?.id === ep.id;
            const canPlayEp = isVIPMode || ep.isFree || ep.isUnlocked;

            return (
              <button
                key={ep.id}
                onClick={() => handleEpisodeClick(ep)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'glass-card border-ruby/50 bg-ruby/10'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  <img
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                  {!canPlayEp && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-lg">🔒</span>
                    </div>
                  )}
                  {isActive && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`w-1 bg-ruby rounded-full animate-pulse`} style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${
                      isActive ? 'text-ruby' : 'text-muted-light'
                    }`}>
                      Tập {ep.episodeNumber}
                    </span>
                    {ep.isFree && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-verified/20 text-verified font-medium">
                        Miễn phí
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${
                    isActive ? 'text-foreground font-medium' : 'text-muted-light'
                  }`}>
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted">{ep.duration}</span>
                    {!canPlayEp && !ep.isFree && (
                      <span className="text-[10px] text-coin font-medium">🪙 {ep.price}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
