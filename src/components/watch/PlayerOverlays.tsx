'use client';

import { useState } from 'react';

import { formatDuration } from '@/features/production/lib/format';
import type { AdScheduleItem } from '@/types/playback';
import type { Episode } from '@/types/movie';

/**
 * The mid-roll ad over the paused episode (BR-33). It plays to the end; only then does "Bỏ qua quảng cáo"
 * appear to go back to the episode. An ad that fails to load hands the picture back at once.
 */
export function AdBreakOverlay({ cue, onDone }: { cue: AdScheduleItem; onDone: (watched: boolean) => void }) {
  const [left, setLeft] = useState(cue.ad.durationSeconds);
  const [ended, setEnded] = useState(false);
  return (
    <div className="absolute inset-0 z-30 bg-black flex items-center justify-center" data-testid="ad-break">
      <video
        key={cue.breakId}
        src={cue.ad.mediaUrl}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        onTimeUpdate={(e) => setLeft(Math.ceil((e.currentTarget.duration || cue.ad.durationSeconds) - e.currentTarget.currentTime))}
        onEnded={() => setEnded(true)}
        onError={() => onDone(false)}
      />
      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/75 text-amber-300 text-xs font-bold border border-white/15">
        {ended ? 'Quảng cáo đã kết thúc' : `Quảng cáo · ${formatDuration(Math.max(0, left))}`}
      </span>
      <span className="absolute bottom-4 left-4 text-[11px] text-white/70 line-clamp-1 max-w-[45%]">{cue.ad.title}</span>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {cue.ad.clickUrl && (
          <a
            href={cue.ad.clickUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold border border-white/20 hover:bg-white/25"
          >
            Tìm hiểu thêm
          </a>
        )}
        {ended && (
          <button
            type="button"
            onClick={() => onDone(true)}
            autoFocus
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold shadow-lg hover:bg-amber-100 cursor-pointer"
          >
            Bỏ qua quảng cáo
          </button>
        )}
      </div>
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

/** Over a locked episode: why it is locked (a preview stops at 30s) and the Coin price to unlock it. */
export function LockedOverlay({ episode, onUnlock }: { episode: Episode; onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 video-blur-overlay flex flex-col items-center justify-center p-6">
      <div className="text-center animate-fade-in max-w-md">
        <h3 className="text-xl font-bold text-white mb-2">Tập Phim Đang Bị Khóa</h3>
        <p className="text-muted-light mb-5 text-xs sm:text-sm leading-relaxed">
          {episode.isPreview
            ? 'Bạn chỉ được xem thử 30 giây đầu. Mở khóa bằng Coin hoặc đăng ký gói Tháng để xem trọn bộ.'
            : 'Mở khóa tập phim bằng Coin để thưởng thức nội dung AI đỉnh cao.'}
        </p>
        <button
          onClick={onUnlock}
          className="btn-shimmer px-7 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-xl hover:shadow-ruby/40 transition-all active:scale-95 cursor-pointer text-sm shadow-md"
        >
           Mở khóa ngay - {episode.price} Coins
        </button>
      </div>
    </div>
  );
}
