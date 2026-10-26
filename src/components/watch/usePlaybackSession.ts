import { useEffect, useState, type RefObject } from 'react';
import { playbackService } from '@/services/playbackService';
import type { StreamingSession } from '@/types/playback';

/** The BE expects a beat every 10-15s and closes a silent session, paused or not. */
export const HEARTBEAT_SECONDS = 15;
/** A saved position this close to the start is not worth the resume question. */
const MIN_RESUME_SECONDS = 5;

export interface PlaybackSessionState {
  session: StreamingSession | null;
  error: string | null;
  /** The break the BE says the playhead passed without playing it (a forward seek). */
  dueBreakId: string | null;
  /** Where the member stopped last time, until they answer the resume question. */
  resumeAt: number | null;
  answerResume: (resume: boolean) => void;
}

/** Resume point worth asking about: past the first seconds and before the credits. */
export function resumePointOf(session: Pick<StreamingSession, 'resumePositionSeconds' | 'stream'>): number | null {
  const at = session.resumePositionSeconds ?? 0;
  const duration = session.stream.durationSeconds;
  if (at < MIN_RESUME_SECONDS) return null;
  if (duration && at >= duration * 0.95) return null;
  return at;
}

function seekWhenReady(video: HTMLVideoElement, seconds: number) {
  if (video.readyState >= 1) {
    video.currentTime = seconds;
    return;
  }
  video.addEventListener('loadedmetadata', () => (video.currentTime = seconds), { once: true });
}

/**
 * Main Flow 3: once MF-2 granted access, opens a streaming session (stream, ads, resume point),
 * beats while the video plays, completes it on `ended` and stops it when the viewer leaves.
 */
export function usePlaybackSession(
  videoRef: RefObject<HTMLVideoElement | null>,
  episodeId: string | undefined,
  canPlay: boolean,
): PlaybackSessionState {
  const [state, setState] = useState<{ episodeId: string; session: StreamingSession | null; error: string | null } | null>(null);
  const [due, setDue] = useState<{ sessionId: string; breakId: string } | null>(null);
  const [resume, setResume] = useState<{ sessionId: string; at: number } | null>(null);

  useEffect(() => {
    if (!episodeId || !canPlay) return;
    let cancelled = false;
    let opened: StreamingSession | null = null;
    let finished = false;
    let tick: ReturnType<typeof setInterval> | undefined;
    const video = videoRef.current;
    const position = () => Math.floor(video?.currentTime ?? 0);
    const onEnded = () => {
      if (!opened || finished) return;
      finished = true;
      void playbackService.complete(opened.sessionId, position());
    };

    playbackService.openSession(episodeId).then((res) => {
      if (cancelled) {
        if (res.success && res.data) void playbackService.stop(res.data.sessionId, 0);
        return;
      }
      if (!res.success || !res.data) {
        setState({ episodeId, session: null, error: res.message ?? 'Không mở được phiên xem.' });
        return;
      }
      const session = res.data;
      opened = session;
      setState({ episodeId, session, error: null });
      const at = resumePointOf(session);
      if (at !== null) setResume({ sessionId: session.sessionId, at });
      video?.addEventListener('ended', onEnded);
      // Counts the seconds that really played; a pause or an ad beats with 0 so it neither expires nor earns.
      let seconds = 0;
      let watched = 0;
      tick = setInterval(() => {
        if (finished) return;
        if (video && !video.paused) watched += 1;
        seconds += 1;
        if (seconds < HEARTBEAT_SECONDS) return;
        const credit = watched;
        seconds = 0;
        watched = 0;
        void playbackService.heartbeat(session.sessionId, position(), credit).then((r) => {
          if (r.success && r.data?.dueAdBreakId) setDue({ sessionId: session.sessionId, breakId: r.data.dueAdBreakId });
        });
      }, 1000);
    });

    return () => {
      cancelled = true;
      clearInterval(tick);
      video?.removeEventListener('ended', onEnded);
      if (opened && !finished) void playbackService.stop(opened.sessionId, position());
    };
  }, [videoRef, episodeId, canPlay]);

  const current = state && state.episodeId === episodeId && canPlay ? state : null;
  const sessionId = current?.session?.sessionId;
  const resumeAt = resume && resume.sessionId === sessionId ? resume.at : null;

  return {
    session: current?.session ?? null,
    error: current?.error ?? null,
    dueBreakId: due && due.sessionId === sessionId ? due.breakId : null,
    resumeAt,
    answerResume: (yes) => {
      const video = videoRef.current;
      if (yes && video && resumeAt !== null) seekWhenReady(video, resumeAt);
      setResume(null);
    },
  };
}
