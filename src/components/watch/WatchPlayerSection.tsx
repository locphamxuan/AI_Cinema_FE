'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Episode, EpisodeVersion } from '@/types/movie';
import ComplianceDrawer from './ComplianceDrawer';
import EpisodeVersionDrawer from './EpisodeVersionDrawer';
import { QualitySelect } from './QualitySelect';
import EpisodePlaylist from './EpisodePlaylist';
import { useHlsPlayer } from './useHlsPlayer';
import { useEpisodeStream } from './useEpisodeStream';
import { usePlaybackSession } from './usePlaybackSession';
import { useAdBreaks } from './useAdBreaks';
import { AdBreakOverlay, ResumePrompt } from './PlayerOverlays';
import { Bookmark, Heart } from 'lucide-react';
import { savedMovieService } from '@/services/savedMovieService';
import { engagementService, type MovieEngagement } from '@/services/engagementService';
import { toast } from '@/components/ui/Toast';

function defaultVersion(episode: Episode | null): EpisodeVersion | null {
  if (!episode?.versions?.length) return null;
  return episode.versions.find((v) => v.isCurrent) || episode.versions[0];
}

interface WatchPlayerSectionProps {
  episodeId?: string;
}

export default function WatchPlayerSection({ episodeId }: WatchPlayerSectionProps) {
  const { currentMovie, openUnlockModal, openAuthModal, isAuthenticated, selectEpisode, isCatalogLoading } = useAppStore();
  const [isSaved, setIsSaved] = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);
  const [engagement, setEngagement] = useState<MovieEngagement | null>(null);
  const [likingBusy, setLikingBusy] = useState(false);
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

  useEffect(() => {
    if (!currentMovie) return;
    if (isAuthenticated) {
      savedMovieService.isSaved(currentMovie.id).then((res) => {
        if (res.success && res.data) setIsSaved(res.data.saved);
      }).catch(() => {});
    }
    engagementService.summary(currentMovie.id).then((res) => {
      if (res.success && res.data) setEngagement(res.data);
    }).catch(() => {});
  }, [currentMovie?.id, isAuthenticated]);

  // The route's episode unless one was picked from the list since; its current version unless another was picked.
  const shownId = picked && picked.route === episodeId ? picked.episodeId : episodeId;
  const currentEpisode = currentMovie?.episodes.find((e) => e.id === shownId) || currentMovie?.episodes[0] || null;
  const activeVersion =
    pickedVersion && pickedVersion.episodeId === currentEpisode?.id ? pickedVersion.version : defaultVersion(currentEpisode);

  // Free starters play at once; anything else plays once the BE access decision granted it (MF-2),
  // which the unlock modal records as isUnlocked - a running plan included.
  const stream = useEpisodeStream(currentEpisode?.id, !!currentEpisode?.isUnlocked);
  const canPlay = currentEpisode ? currentEpisode.isFree || currentEpisode.isUnlocked || stream.accessGranted : false;

  // MF-3: a granted episode plays through a streaming session (ads, stream limit, progress).
  const playback = usePlaybackSession(videoRef, currentEpisode?.id, canPlay);
  const { activeAd, finishAd } = useAdBreaks(videoRef, playback.session, playback.dueBreakId);

  // A version picked in the drawer plays its own stream, else the session's; a locked episode only its preview.
  const pickedStream = pickedVersion && pickedVersion.episodeId === currentEpisode?.id ? pickedVersion.version.hlsUrl : undefined;
  const streamUrl = pickedStream || (canPlay ? playback.session?.stream.masterUrl : currentEpisode?.hlsUrl);

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
    const canPlayEp = ep.isFree || ep.isUnlocked;
    if (canPlayEp) {
      setPicked({ route: episodeId, episodeId: ep.id });
      setPickedVersion(null);
    } else {
      openUnlockModal(ep.id);
    }
  };

  const handleToggleSave = async () => {
    if (!currentMovie) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setSavingBusy(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    const res = nextSaved ? await savedMovieService.save(currentMovie.id) : await savedMovieService.unsave(currentMovie.id);
    setSavingBusy(false);
    if (res.success) {
      toast.success(nextSaved ? 'Đã lưu phim' : 'Đã bỏ lưu', nextSaved ? `"${currentMovie.title}" đã được thêm vào danh sách xem sau.` : `Đã xóa "${currentMovie.title}" khỏi danh sách.`);
    } else {
      setIsSaved(!nextSaved);
      toast.error('Thao tác thất bại', 'Vui lòng thử lại sau.');
    }
  };

  const handleToggleLike = async () => {
    if (!currentMovie) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setLikingBusy(true);
    const wasLiked = engagement?.likedByMe ?? false;
    const currentCount = engagement?.likeCount ?? 0;
    setEngagement((prev) => ({
      likeCount: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
      viewCount: prev?.viewCount ?? 0,
      likedByMe: !wasLiked,
    }));
    const res = wasLiked ? await engagementService.unlike(currentMovie.id) : await engagementService.like(currentMovie.id);
    setLikingBusy(false);
    if (res.success && res.data) {
      setEngagement(res.data);
    } else {
      setEngagement((prev) => ({
        likeCount: currentCount,
        viewCount: prev?.viewCount ?? 0,
        likedByMe: wasLiked,
      }));
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
                  default={track.isDefault ?? index === 0}
                />
              ))}
            </video>

            {activeAd && <AdBreakOverlay cue={activeAd} onDone={finishAd} />}
            {playback.resumeAt !== null && !activeAd && <ResumePrompt at={playback.resumeAt} onAnswer={playback.answerResume} />}
            {playback.error && (
              <div role="alert" className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 text-center text-sm text-white">
                {playback.error}
              </div>
            )}

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
                      ? 'Bạn chỉ được xem thử 30 giây đầu. Mở khóa bằng Coin hoặc đăng ký gói Tháng để xem trọn bộ.'
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
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] sm:text-xs text-muted-light hover:text-white hover:bg-black/90 transition-all cursor-pointer border border-white/15 shadow-xl z-40"
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
                {currentEpisode.displayLabel ?? `Tập ${currentEpisode.episodeNumber}`}
              </span>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentMovie.title} - {currentEpisode.title}
            </h1>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={savingBusy}
                onClick={handleToggleSave}
                title={isSaved ? 'Đã lưu trong danh sách xem sau' : 'Lưu vào danh sách xem sau'}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-amber-500' : ''}`} />
                <span>{isSaved ? 'Đã Lưu' : 'Lưu Phim'}</span>
              </button>
              <button
                type="button"
                disabled={likingBusy}
                onClick={handleToggleLike}
                title="Thả tim yêu thích"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  engagement?.likedByMe
                    ? 'bg-ruby/20 text-ruby border-ruby/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${engagement?.likedByMe ? 'fill-current text-ruby' : ''}`} />
                <span>{engagement?.likeCount ?? 0}</span>
              </button>
            </div>
          </div>

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
        canPlay={(ep) => ep.isFree || ep.isUnlocked}
        onSelect={handleEpisodeClick}
      />
    </div>
  );
}
