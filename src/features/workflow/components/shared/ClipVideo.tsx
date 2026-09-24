'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export interface ClipVideoProps {
  src: string;
  className?: string;
}

/** Plays a generated clip; HLS streams go through hls.js where the browser has no native support. */
export function ClipVideo({ src, className }: ClipVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const isHls = src.includes('.m3u8');
    if (!isHls || video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (!Hls.isSupported()) return;
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [src]);

  return <video ref={videoRef} controls playsInline className={className} />;
}
