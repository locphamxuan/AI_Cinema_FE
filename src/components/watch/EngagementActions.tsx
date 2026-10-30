'use client';

import { Bookmark, Heart } from 'lucide-react';
import type { useMovieEngagement } from '@/hooks/useMovieEngagement';

/** Save-for-later and like buttons under the player. */
export function EngagementActions({
  isSaved,
  savingBusy,
  engagement,
  likingBusy,
  toggleSave,
  toggleLike,
}: ReturnType<typeof useMovieEngagement>) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <button
        type="button"
        disabled={savingBusy}
        onClick={toggleSave}
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
        onClick={toggleLike}
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
  );
}
