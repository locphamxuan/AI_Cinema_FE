'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/** Plain HLS player for reviewing a delivered version (self-hosted renditions or the studio's link). */
export function HlsPreview({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState<{ src: string } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (!Hls.isSupported()) return;
    const hls = new Hls();
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) setFailed({ src });
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [src]);

  return (
    <div className="space-y-1">
      <video ref={videoRef} controls playsInline className="w-full aspect-video rounded-xl bg-black" />
      {failed?.src === src && <p className="text-[11px] text-rose-600">Không phát được luồng HLS này. Kiểm tra link của studio.</p>}
    </div>
  );
}
