import Link from 'next/link';
import { Video, CheckCircle2, Clock, Play } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface StudioLinkTabProps {
  currentPackage: EpisodePackage;
  canEnterStudio: boolean;
  onGotoBrief: () => void;
}

export function StudioLinkTab({ currentPackage, canEnterStudio, onGotoBrief }: StudioLinkTabProps) {
  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Production Studio Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Không gian điều khiển sinh video, thoại AI & lắp ghép timeline</p>
        </div>
      </div>

      {canEnterStudio ? (
        <div className="p-6 bg-purple-50/50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Studio Đã Sẵn Sàng Hoạt Động</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Hạn mức Token Quota: <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{currentPackage.quota_allocated} Tokens</span>
            </p>
          </div>
          <Link
            href={`/creator/studio/${currentPackage.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs shadow-md shadow-ruby/20 transition"
          >
            <Play className="w-4 h-4" /> Truy Cập AI Studio Ngay
          </Link>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-center space-y-3">
          <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Studio Đang Khóa (Chờ Duyệt Quota)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Kịch bản của bạn đang ở trạng thái <span className="font-bold text-amber-600 dark:text-amber-400">{currentPackage.status}</span>.
              Reviewer (Checker) cần phê duyệt và cấp Token Quota trước khi bắt đầu sinh clip.
            </p>
          </div>
          <button
            onClick={onGotoBrief}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#12141A] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 transition cursor-pointer"
          >
            Kiểm Tra Lại Bản Kế Hoạch ➔
          </button>
        </div>
      )}
    </div>
  );
}
