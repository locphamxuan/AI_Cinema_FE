import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { playbackService } from '@/services/playbackService';
import type { AdScheduleItem, StreamingSession } from '@/types/playback';

/**
 * The cue to play at this position: the latest one the playhead reached and that was not handled
 * yet. A forward seek over several cues plays only the nearest one (BR-33); the earlier ones are
 * passed, as the BE marks them SKIPPED.
 */
export function cuesReached(schedule: AdScheduleItem[], position: number, handled: ReadonlySet<string>) {
  const reached = schedule.filter((c) => !handled.has(c.breakId) && c.positionSeconds <= position);
  if (reached.length === 0) return null;
  const play = reached.reduce((a, b) => (b.positionSeconds > a.positionSeconds ? b : a));
  return { play, passed: reached.map((c) => c.breakId) };
}

/**
 * Mid-roll ads of a session: pauses the episode at each cue, reports the start and the end of the
 * ad (the impression and the completed view) and resumes the episode afterwards.
 */
export function useAdBreaks(
  videoRef: RefObject<HTMLVideoElement | null>,
  session: StreamingSession | null,
  dueBreakId: string | null,
) {
  const [playing, setPlaying] = useState<{ sessionId: string; cue: AdScheduleItem } | null>(null);
  const handled = useRef(new Set<string>());
  const activeRef = useRef<AdScheduleItem | null>(null);
  const sessionId = session?.sessionId;
  const schedule = session?.adSchedule;

  const start = useCallback(
    (cue: AdScheduleItem) => {
      const video = videoRef.current;
      if (!video || !sessionId || activeRef.current) return;
      handled.current.add(cue.breakId);
      activeRef.current = cue;
      video.pause();
      setPlaying({ sessionId, cue });
      void playbackService.adStarted(sessionId, cue.breakId, Math.floor(video.currentTime));
    },
    [videoRef, sessionId],
  );

  // A new session starts with none of its cues handled; an ad of the old one is dropped.
  useEffect(() => {
    handled.current = new Set();
    activeRef.current = null;
  }, [sessionId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !schedule?.length) return;
    const onTime = () => {
      if (activeRef.current) return;
      const due = cuesReached(schedule, video.currentTime, handled.current);
      if (!due) return;
      due.passed.forEach((id) => handled.current.add(id));
      start(due.play);
    };
    // The episode stays paused while the ad plays, whatever the viewer presses.
    const onPlay = () => activeRef.current && video.pause();
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('play', onPlay);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('play', onPlay);
    };
  }, [videoRef, schedule, start]);

  // The heartbeat named a break the playhead passed without it playing.
  useEffect(() => {
    if (!dueBreakId || handled.current.has(dueBreakId)) return;
    const cue = schedule?.find((c) => c.breakId === dueBreakId);
    if (cue) start(cue);
  }, [dueBreakId, schedule, start]);

  /** `watched` is false when the ad could not load: the episode resumes without a completed view. */
  const finish = useCallback(
    (watched: boolean) => {
      const cue = activeRef.current;
      if (!cue) return;
      activeRef.current = null;
      setPlaying(null);
      if (watched && sessionId) void playbackService.adFinished(sessionId, cue.breakId);
      void videoRef.current?.play().catch(() => {});
    },
    [videoRef, sessionId],
  );

  return { activeAd: playing && playing.sessionId === sessionId ? playing.cue : null, finishAd: finish };
}
