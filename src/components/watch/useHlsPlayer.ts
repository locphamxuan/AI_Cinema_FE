import { useEffect, useRef, useState, type RefObject } from 'react';
import Hls from 'hls.js';
import type { QualityLevel } from './QualitySelect';

interface HlsOptions {
  enabled: boolean;
  streamUrl?: string;
  /** Full playback; otherwise only a preview episode is loaded (the page cuts it at 30s). */
  canPlay: boolean;
  isPreview: boolean;
}

/** Attaches an HLS stream to the video and exposes the renditions of its master playlist. */
export function useHlsPlayer(videoRef: RefObject<HTMLVideoElement | null>, options: HlsOptions) {
  const { enabled, streamUrl, canPlay, isPreview } = options;
  const hlsRef = useRef<Hls | null>(null);
  // Renditions hls.js found in the master playlist; -1 lets it pick by bandwidth.
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [level, setLevel] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video || !streamUrl) return;

    const destroy = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    destroy();
    setLevels([]);
    setLevel(-1);

    if (canPlay) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLevels(
            hls.levels
              .map((l, index) => ({ index, height: l.height }))
              .filter((l) => l.height > 0)
              .sort((a, b) => b.height - a.height),
          );
          video.play().catch(() => {});
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
      }
    } else if (isPreview && Hls.isSupported()) {
      // A locked preview episode still loads, so the first 30 seconds can be watched.
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
    }

    return destroy;
  }, [videoRef, enabled, streamUrl, canPlay, isPreview]);

  const selectLevel = (index: number) => {
    setLevel(index);
    if (hlsRef.current) hlsRef.current.currentLevel = index;
  };

  return { levels, level, selectLevel };
}
