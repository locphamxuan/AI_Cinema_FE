'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { apiClient } from '@/services/apiClient';
import type { PackageSubtitle } from '@/types/workflow';

export interface ClipVideoProps {
  src: string;
  className?: string;
  /** Subtitle tracks behind auth; loaded with the user's token and attached as blob URLs. */
  subtitles?: PackageSubtitle[];
}

/** Plays a generated clip; HLS streams go through hls.js where the browser has no native support. */
export function ClipVideo({ src, className, subtitles = [] }: ClipVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tracks, setTracks] = useState<(PackageSubtitle & { url: string })[]>([]);
  const subtitleKey = subtitles.map((s) => s.endpoint).join('|');

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

  useEffect(() => {
    if (subtitles.length === 0) return;
    let cancelled = false;
    let urls: string[] = [];
    Promise.all(subtitles.map((s) => apiClient.getText(s.endpoint))).then((texts) => {
      if (cancelled) return;
      const loaded = subtitles.flatMap((s, i) => {
        const text = texts[i];
        return text ? [{ ...s, url: URL.createObjectURL(new Blob([text], { type: 'text/vtt' })) }] : [];
      });
      urls = loaded.map((t) => t.url);
      setTracks(loaded);
    });
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
      setTracks([]);
    };
    // subtitleKey stands in for the array, which callers rebuild on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleKey]);

  return (
    <video ref={videoRef} controls playsInline className={className}>
      {tracks.map((track, index) => (
        <track key={track.url} kind="subtitles" src={track.url} srcLang={track.language} label={track.label} default={index === 0} />
      ))}
    </video>
  );
}
