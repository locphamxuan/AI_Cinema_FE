'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Episode, EpisodeVersion } from '@/types/movie';
import ComplianceDrawer from './ComplianceDrawer';
import EpisodeVersionDrawer from './EpisodeVersionDrawer';
import { QualitySelect } from './QualitySelect';
import EpisodePlaylist from './EpisodePlaylist';
import { useHlsPlayer } from './useHlsPlayer';

function defaultVersion(episode: Episode | null): EpisodeVersion | null {
  if (!episode?.versions?.length) return null;
  return episode.versions.find((v) => v.isCurrent) || episode.versions[0];
}

interface WatchPlayerSectionProps {
  episodeId?: string;
}

export default function WatchPlayerSection({ episodeId }: WatchPlayerSectionProps) {
  const { currentMovie, isVIPMode, openUnlockModal, selectEpisode, isCatalogLoading } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  // The episode picked in the list (for the route it was picked on) and the version picked for it.
  const [picked, setPicked] = useState<{ route?: string; episodeId: string } | null>(null);
  const [pickedVersion, setPickedVersion] = useState<{ episodeId: string; version: EpisodeVersion } | null>(null);
  const [showComplianceDrawer, setShowComplianceDrawer] = useState(false);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [versionToast, setVersionToast] = useState<string | null>(null);

  useEffect(() => {
    if (episodeId) selectEpisode(episodeId);
  }, [episodeId, selectEpisode]);

  // The route's episode unless one was picked from the list since; its current version unless another was picked.
  const shownId = picked && picked.route === episodeId ? picked.episodeId : episodeId;
  const currentEpisode = currentMovie?.episodes.find((e) => e.id === shownId) || currentMovie?.episodes[0] || null;
  const activeVersion =
    pickedVersion && pickedVersion.episodeId === currentEpisode?.id ? pickedVersion.version : defaultVersion(currentEpisode);

  // Can the user play this episode?
  const canPlay = currentEpisode
    ? isVIPMode || currentEpisode.isFree || currentEpisode.isUnlocked
    : false;

  // Stream URL: use active version's HLS URL if available, else episode default
  const streamUrl = activeVersion ? activeVersion.hlsUrl : currentEpisode?.hlsUrl;

  const { levels, level, selectLevel: handleSelectLevel } = useHlsPlayer(videoRef, {
    enabled: !!currentEpisode,
    streamUrl,
    canPlay,
    isPreview: !!currentEpisode?.isPreview,
  });

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
      setPicked({ route: episodeId, episodeId: ep.id });
      setPickedVersion(null);
    } else {
      openUnlockModal(ep.id);
    }
  };

  const handleSelectVersion = (version: EpisodeVersion) => {
    if (currentEpisode) setPickedVersion({ episodeId: currentEpisode.id, version });
    setShowVersionDrawer(false);
    setVersionToast(`Đã chuyển sang ${version.versionNumber}: ${version.versionTitle}`);
    setTimeout(() => setVersionToast(null), 3500);
  };

  if (!currentMovie || !currentEpisode) {
    return (
      <div className="py-24 text-center text-sm text-muted-light">
        {isCatalogLoading ? 'Đang tải phim...' : 'Không tìm thấy tập phim này hoặc tập chưa được phát hành.'}
      </div>
    );
  }

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
            >
              {currentEpisode.subtitles.map((track, index) => (
                <track
                  key={`${currentEpisode.id}-${track.language}`}
                  kind="subtitles"
                  src={track.src}
                  srcLang={track.language}
                  label={track.label}
                  default={index === 0}
                />
              ))}
            </video>

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

            {/* Compliance Badge Button (Top left to not obstruct video seek bar / controls) */}
            <button
              onClick={() => setShowComplianceDrawer(true)}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] sm:text-xs text-muted-light hover:text-white hover:bg-black/90 transition-all cursor-pointer border border-white/15 shadow-xl z-20"
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
              {currentEpisode.qualities.length > 0 && (
                <span className="quality-badge">{currentEpisode.qualities.at(-1)}</span>
              )}
              {currentEpisode.subtitles.length > 0 && (
                <span className="quality-badge" title="Phụ đề có sẵn">
                  CC · {currentEpisode.subtitles.map((track) => track.label).join(', ')}
                </span>
              )}
              {levels.length > 1 && <QualitySelect levels={levels} value={level} onChange={handleSelectLevel} />}
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

      <EpisodePlaylist
        movie={currentMovie}
        currentEpisodeId={currentEpisode.id}
        isPlaying={isPlaying}
        canPlay={(ep) => isVIPMode || ep.isFree || ep.isUnlocked}
        onSelect={handleEpisodeClick}
      />
    </div>
  );
}
