'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Episode, EpisodeVersion } from '@/types/movie';
import ComplianceDrawer from './ComplianceDrawer';
import EpisodeVersionDrawer from './EpisodeVersionDrawer';
import Hls from 'hls.js';

interface WatchPlayerSectionProps {
  episodeId?: string;
}

export default function WatchPlayerSection({ episodeId }: WatchPlayerSectionProps) {
  const { currentMovie, isVIPMode, openUnlockModal } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [activeVersion, setActiveVersion] = useState<EpisodeVersion | null>(null);
  const [showComplianceDrawer, setShowComplianceDrawer] = useState(false);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [versionToast, setVersionToast] = useState<string | null>(null);

  // Determine current episode and its default version
  useEffect(() => {
    const ep = currentMovie.episodes.find((e) => e.id === episodeId) || currentMovie.episodes[0];
    setCurrentEpisode(ep);

    if (ep?.versions && ep.versions.length > 0) {
      const defaultVer = ep.versions.find((v) => v.isCurrent) || ep.versions[0];
      setActiveVersion(defaultVer);
    } else {
      setActiveVersion(null);
    }
  }, [episodeId, currentMovie.episodes]);

  // Can the user play this episode?
  const canPlay = currentEpisode
    ? isVIPMode || currentEpisode.isFree || currentEpisode.isUnlocked
    : false;

  // Stream URL: use active version's HLS URL if available, else episode default
  const streamUrl = activeVersion ? activeVersion.hlsUrl : currentEpisode?.hlsUrl;

  // Setup HLS player
  useEffect(() => {
    if (!currentEpisode || !videoRef.current || !streamUrl) return;

    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (canPlay) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
      }
    } else {
      // For locked episodes, load but limit to 30s preview
      if (currentEpisode.isPreview) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
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
  }, [currentEpisode, canPlay, streamUrl]);

  // 30s trailer limit for locked content
  useEffect(() => {
    if (!videoRef.current || canPlay) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video.currentTime >= 30) {
        video.pause();
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
      if (ep.versions && ep.versions.length > 0) {
        const defaultVer = ep.versions.find((v) => v.isCurrent) || ep.versions[0];
        setActiveVersion(defaultVer);
      }
    } else {
      openUnlockModal(ep.id);
    }
  };

  const handleSelectVersion = (version: EpisodeVersion) => {
    setActiveVersion(version);
    setShowVersionDrawer(false);
    setVersionToast(`Đã chuyển sang ${version.versionNumber}: ${version.versionTitle}`);
    setTimeout(() => setVersionToast(null), 3500);
  };

  if (!currentEpisode) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Video Player Area */}
      <div className="flex-1">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-2xl">
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
            <div className="absolute inset-0 video-blur-overlay flex flex-col items-center justify-center p-4">
              <div className="text-center animate-fade-in">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Tập phim bị khóa</h3>
                <p className="text-muted-light mb-4 text-sm max-w-xs mx-auto">
                  {currentEpisode.isPreview
                    ? 'Bạn chỉ được xem 30 giây đầu. Mở khóa bằng Coin hoặc nâng cấp VIP để xem trọn vẹn.'
                    : 'Mở khóa tập phim để thưởng thức nội dung đầy đủ.'}
                </p>
                <button
                  onClick={() => openUnlockModal(currentEpisode.id)}
                  className="px-6 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 cursor-pointer"
                >
                  🪙 Mở khóa - {currentEpisode.price} Coins
                </button>
              </div>
            </div>
          )}

          {/* Toast Notification when version changes */}
          {versionToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-neon/90 backdrop-blur-md text-white text-xs font-bold shadow-xl animate-slide-down flex items-center gap-2 z-30">
              <span>🔄</span>
              <span>{versionToast}</span>
            </div>
          )}

          {/* Compliance Label (Bottom left) */}
          <button
            onClick={() => setShowComplianceDrawer(true)}
            className="absolute bottom-3 left-3 right-3 sm:left-3 sm:right-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] sm:text-xs text-muted-light hover:text-foreground hover:bg-black/90 transition-colors cursor-pointer border border-white/15 shadow-lg z-20"
          >
            <span>🏷️</span>
            <span className="line-clamp-1">
              Nội dung tạo 100% bằng AI (Tuân thủ Điều 44 Luật AI & Nghị định 142)
            </span>
          </button>
        </div>

        {/* Episode Info & Version Bar */}
        <div className="mt-4 glass-card p-5 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-ruby/20 text-ruby text-xs font-bold">
                Tập {currentEpisode.episodeNumber}
              </span>
              {isVIPMode && (
                <span className="px-2.5 py-0.5 rounded bg-coin/20 text-coin text-xs font-bold">
                  👑 VIP
                </span>
              )}
              <span className="text-muted-light text-xs font-mono">{currentEpisode.duration}</span>
            </div>

            {/* VERSION CONTROL BUTTON / BADGE */}
            {currentEpisode.versions && currentEpisode.versions.length > 0 && (
              <button
                onClick={() => setShowVersionDrawer(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neon/15 hover:bg-neon/25 border border-neon/30 text-neon text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-neon/10"
                title="Bấm để xem lịch sử hiệu chỉnh và quản lý phiên bản"
              >
                <span>🗂️</span>
                <span>
                  Phiên bản: <strong className="text-white underline decoration-neon">{activeVersion?.versionNumber || currentEpisode.currentVersion || 'v1.0.0'}</strong>
                </span>
                <span className="text-[10px] bg-neon text-white px-1.5 py-0.2 rounded-full">
                  {currentEpisode.versions.length} bản ▾
                </span>
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {currentMovie.title} - {currentEpisode.title}
          </h1>

          {/* Active Version Subtitle / Changelog summary */}
          {activeVersion && (
            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neon font-bold">{activeVersion.versionNumber}:</span>
                <span className="text-foreground/90 font-medium">{activeVersion.versionTitle}</span>
                <span className="text-muted text-[11px]">({activeVersion.aiModel})</span>
              </div>
              <button
                onClick={() => setShowVersionDrawer(true)}
                className="text-neon hover:underline text-[11px] font-semibold"
              >
                Xem chi tiết hiệu chỉnh →
              </button>
            </div>
          )}

          <p className="text-muted-light text-sm mt-3 leading-relaxed">{currentEpisode.synopsis}</p>

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/5">
            {currentMovie.genre.map((g) => (
              <span key={g} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-muted-light font-medium">
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

        {/* Episode Version Management Drawer */}
        <EpisodeVersionDrawer
          isOpen={showVersionDrawer}
          onClose={() => setShowVersionDrawer(false)}
          episode={currentEpisode}
          activeVersionId={activeVersion?.id || ''}
          onSelectVersion={handleSelectVersion}
        />
      </div>

      {/* Episode List Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <h3 className="text-sm font-bold text-muted-light uppercase tracking-wider mb-3">
          Danh sách tập ({currentMovie.totalEpisodes} tập)
        </h3>
        <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {currentMovie.episodes.map((ep) => {
            const isActive = currentEpisode?.id === ep.id;
            const canPlayEp = isVIPMode || ep.isFree || ep.isUnlocked;

            return (
              <button
                key={ep.id}
                onClick={() => handleEpisodeClick(ep)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'glass-card border-ruby/50 bg-ruby/10 shadow-md shadow-ruby/10'
                    : 'hover:bg-white/5 border border-transparent'
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
                          <div
                            key={i}
                            className="w-1 bg-ruby rounded-full animate-pulse"
                            style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isActive ? 'text-ruby' : 'text-muted-light'}`}>
                      Tập {ep.episodeNumber}
                    </span>
                    {ep.isFree && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-verified/20 text-verified font-medium">
                        Miễn phí
                      </span>
                    )}
                    {ep.versions && (
                      <span className="text-[9px] px-1 rounded bg-white/10 text-muted-light font-mono">
                        {ep.currentVersion || 'v1.0'}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate font-medium ${isActive ? 'text-foreground' : 'text-muted-light'}`}>
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted">{ep.duration}</span>
                    {!canPlayEp && !ep.isFree && (
                      <span className="text-[10px] text-coin font-bold">🪙 {ep.price}</span>
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
