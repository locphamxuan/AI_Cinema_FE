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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Video Player Canvas */}
      <div className="flex-1 space-y-6">
        <div className="relative group">
          {/* Ambient Lighting Ambilight Aura */}
          <div className="absolute -inset-4 ambient-glow-ruby -z-10 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

          {/* Video Player Frame */}
          <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border border-white/15 shadow-2xl shadow-black/80">
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
              <div className="absolute inset-0 video-blur-overlay flex flex-col items-center justify-center p-6">
                <div className="text-center animate-fade-in max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-ruby/20 border border-ruby/30 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-ruby/20">
                    🔒
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Tập Phim Đang Bị Khóa</h3>
                  <p className="text-muted-light mb-5 text-xs sm:text-sm leading-relaxed">
                    {currentEpisode.isPreview
                      ? 'Bạn chỉ được xem thử 30 giây đầu. Mở khóa bằng Coin hoặc nâng cấp Hội viên VIP để xem trọn bộ.'
                      : 'Mở khóa tập phim bằng Coin để thưởng thức nội dung AI đỉnh cao.'}
                  </p>
                  <button
                    onClick={() => openUnlockModal(currentEpisode.id)}
                    className="btn-shimmer px-7 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-xl hover:shadow-ruby/40 transition-all active:scale-95 cursor-pointer text-sm shadow-md"
                  >
                    🪙 Mở khóa ngay - {currentEpisode.price} Coins
                  </button>
                </div>
              </div>
            )}

            {/* Toast Notification when version changes */}
            {versionToast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-neon/90 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-slide-down flex items-center gap-2 z-30 border border-white/20">
                <span>🔄</span>
                <span>{versionToast}</span>
              </div>
            )}

            {/* Compliance Badge Button (Bottom left) */}
            <button
              onClick={() => setShowComplianceDrawer(true)}
              className="absolute bottom-3 left-3 right-3 sm:left-3 sm:right-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] sm:text-xs text-muted-light hover:text-white hover:bg-black/95 transition-all cursor-pointer border border-white/15 shadow-xl z-20"
            >
              <span className="text-sm">🏷️</span>
              <span className="line-clamp-1">
                Nội dung tạo 100% bằng AI • Tuân thủ Điều 44 Luật AI & Nghị định 142
              </span>
            </button>
          </div>
        </div>

        {/* Detailed Episode & Audio/Video Specs Bar */}
        <div className="glass-card p-6 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Episode number & Quality pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-ruby/20 border border-ruby/30 text-ruby text-xs font-bold">
                Tập {currentEpisode.episodeNumber}
              </span>
              {isVIPMode && (
                <span className="px-3 py-1 rounded-md bg-coin/20 border border-coin/30 text-coin text-xs font-bold">
                  👑 VIP Member
                </span>
              )}
              <span className="quality-badge">4K UHD</span>
              <span className="quality-badge">HDR10+</span>
              <span className="quality-badge">Dolby Atmos</span>
              <span className="text-muted-light text-xs font-mono">{currentEpisode.duration}</span>
            </div>

            {/* VERSION CONTROL PILL BUTTON */}
            {currentEpisode.versions && currentEpisode.versions.length > 0 && (
              <button
                onClick={() => setShowVersionDrawer(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neon/15 hover:bg-neon/25 border border-neon/35 text-neon text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-neon/15"
                title="Bấm để xem lịch sử hiệu chỉnh và quản lý phiên bản"
              >
                <span>🗂️</span>
                <span>
                  Phiên bản:{' '}
                  <strong className="text-slate-900 dark:text-white underline decoration-neon">
                    {activeVersion?.versionNumber || currentEpisode.currentVersion || 'v1.0.0'}
                  </strong>
                </span>
                <span className="text-[10px] bg-neon text-white px-2 py-0.5 rounded-full font-bold">
                  {currentEpisode.versions.length} bản ▾
                </span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentMovie.title} - {currentEpisode.title}
          </h1>

          {/* Active Version Changelog Snippet */}
          {activeVersion && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-neon/20 text-neon font-bold font-mono text-[11px]">
                  {activeVersion.versionNumber}
                </span>
                <span className="text-slate-800 dark:text-white font-medium">{activeVersion.versionTitle}</span>
                <span className="text-slate-500 dark:text-muted text-[11px]">({activeVersion.aiModel})</span>
              </div>
              <button
                onClick={() => setShowVersionDrawer(true)}
                className="text-neon hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Xem chi tiết hiệu chỉnh</span>
                <span>→</span>
              </button>
            </div>
          )}

          <p className="text-slate-600 dark:text-muted-light text-sm leading-relaxed">{currentEpisode.synopsis}</p>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
            {currentMovie.genre.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-muted-light font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Drawers */}
        <ComplianceDrawer
          isOpen={showComplianceDrawer}
          onClose={() => setShowComplianceDrawer(false)}
          compliance={currentMovie.aiCompliance}
        />

        <EpisodeVersionDrawer
          isOpen={showVersionDrawer}
          onClose={() => setShowVersionDrawer(false)}
          episode={currentEpisode}
          activeVersionId={activeVersion?.id || 'v-001'}
          onSelectVersion={handleSelectVersion}
        />
      </div>

      {/* RIGHT: Episode List / Playlist */}
      <div className="w-full lg:w-88 shrink-0 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-700 dark:text-muted-light uppercase tracking-wider">
            Danh sách tập ({currentMovie.totalEpisodes} tập)
          </h3>
          <span className="text-xs text-neon font-mono font-semibold">HLS Audio Synced</span>
        </div>

        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
          {currentMovie.episodes.map((ep) => {
            const isActive = currentEpisode?.id === ep.id;
            const canPlayEp = isVIPMode || ep.isFree || ep.isUnlocked;

            return (
              <button
                key={ep.id}
                onClick={() => handleEpisodeClick(ep)}
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white dark:bg-ruby/[0.08] border-ruby/60 shadow-lg shadow-ruby/15 ring-1 ring-ruby/30'
                    : 'bg-white dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-[#161922] border border-slate-200 dark:border-white/10">
                  <img
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                  {!canPlayEp && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-base">🔒</span>
                    </div>
                  )}
                  {isActive && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex items-end gap-1 h-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-ruby rounded-full animate-pulse"
                            style={{
                              height: `${6 + i * 3}px`,
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Episode Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-ruby' : 'text-slate-500 dark:text-muted-light'
                      }`}
                    >
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
                    {!canPlayEp && !ep.isFree && (
                      <span className="text-[11px] text-coin font-bold">🪙 {ep.price} Coin</span>
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
