'use client';

import { useState } from 'react';
import { formatDuration } from '@/features/production/lib/format';
import type { AdScheduleItem } from '@/types/playback';

/**
 * The mid-roll ad over the paused episode. It cannot be skipped (BR-33); it ends by itself and an ad
 * that fails to load hands the picture back at once instead of blocking the episode.
 */
export function AdBreakOverlay({ cue, onDone }: { cue: AdScheduleItem; onDone: (watched: boolean) => void }) {
  const [left, setLeft] = useState(cue.ad.durationSeconds);
  return (
    <div className="absolute inset-0 z-30 bg-black flex items-center justify-center" data-testid="ad-break">
      <video
        key={cue.breakId}
        src={cue.ad.mediaUrl}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        onTimeUpdate={(e) => setLeft(Math.ceil(cue.ad.durationSeconds - e.currentTarget.currentTime))}
        onEnded={() => onDone(true)}
        onError={() => onDone(false)}
      />
      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-black/75 text-amber-300 text-xs font-bold border border-white/15">
        Quảng cáo · {formatDuration(Math.max(0, left))}
      </span>
      {cue.ad.clickUrl && (
        <a
          href={cue.ad.clickUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white"
        >
          Tìm hiểu thêm
        </a>
      )}
      <span className="absolute bottom-4 left-4 text-[11px] text-white/70 line-clamp-1 max-w-[60%]">{cue.ad.title}</span>
    </div>
  );
}

/** Resume-or-restart question (flow 3, step 9) for a member who stopped part-way. */
export function ResumePrompt({ at, onAnswer }: { at: number; onAnswer: (resume: boolean) => void }) {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs text-white shadow-2xl">
      <span>Bạn đã xem tới {formatDuration(at)}</span>
      <button type="button" onClick={() => onAnswer(true)} className="px-2.5 py-1 rounded-lg bg-ruby font-bold cursor-pointer">
        Xem tiếp
      </button>
      <button type="button" onClick={() => onAnswer(false)} className="px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer">
        Xem từ đầu
      </button>
    </div>
  );
}
