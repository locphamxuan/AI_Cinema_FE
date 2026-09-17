import { Video, Play, Pause } from 'lucide-react';
import type { GenerationJob, GeneratedAsset } from '@/types/workflow';

export interface StudioPlayerProps {
  selectedJob?: GenerationJob;
  selectedAsset?: GeneratedAsset;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

/** Video viewport previewer for the currently-selected scene, plus its clip metadata bar. */
export function StudioPlayer({ selectedJob, selectedAsset, isPlaying, onTogglePlay }: StudioPlayerProps) {
  return (
    <div className="bg-white dark:bg-[#161922] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
      <div className="p-3.5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Video className="w-4 h-4 text-ruby" />
          <span>Trình Phát Ghép Bản Dựng Phân Cảnh (Episode Assembly)</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#12141A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono text-[11px]">
          4K 60fps • HEVC
        </span>
      </div>

      <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- external mock CDN thumbnail, not a static asset */}
        <img
          src={selectedAsset?.thumbnail_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
          alt="Xem trước phân cảnh"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
              {selectedJob ? selectedJob.title : 'Chọn phân cảnh'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              AI Generated • 100%
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
              <div className="h-full bg-ruby rounded-full w-2/5" />
            </div>

            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={onTogglePlay}
                  aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                  className="w-8 h-8 rounded-full bg-ruby flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-ruby/30"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <span className="font-mono text-xs">00:06 / {selectedAsset ? `00:${selectedAsset.duration_seconds}` : '00:15'}</span>
              </div>

              <span className="text-slate-300 font-mono text-[11px]">Model: {selectedJob?.ai_model || 'CinemaGen v3.2'}</span>
            </div>
          </div>
        </div>
      </div>

      {selectedAsset && selectedJob && (
        <div className="p-3.5 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Độ phân giải</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAsset.resolution}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Thời lượng</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAsset.duration_seconds} Giây</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Dung lượng</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAsset.file_size_mb} MB</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Chi phí Token</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{selectedJob.token_cost} Tokens</span>
          </div>
        </div>
      )}
    </div>
  );
}
