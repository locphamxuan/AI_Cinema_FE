import Link from 'next/link';
import { Tv, Info, Globe, Smartphone, CheckCircle2, Send, Eye } from 'lucide-react';
import type { PublicationVisibility } from '@/types/workflow';

const CHANNELS = [
  { id: 'WEB_OTT', label: 'Web OTT', icon: Globe },
  { id: 'MOBILE_APP', label: 'Mobile App', icon: Smartphone },
  { id: 'SMART_TV', label: 'Smart TV', icon: Tv },
] as const;

export interface PublishStationProps {
  packageId: string;
  isCompliancePassed: boolean;
  isPublished: boolean;
  isPublishing: boolean;
  scheduledDate: string;
  onScheduledDateChange: (value: string) => void;
  visibility: PublicationVisibility;
  onVisibilityChange: (value: PublicationVisibility) => void;
  selectedChannels: string[];
  onToggleChannel: (channel: string) => void;
  onPublish: () => void;
}

export function PublishStation({
  packageId,
  isCompliancePassed,
  isPublished,
  isPublishing,
  scheduledDate,
  onScheduledDateChange,
  visibility,
  onVisibilityChange,
  selectedChannels,
  onToggleChannel,
  onPublish,
}: PublishStationProps) {
  return (
    <div
      className={`bg-white dark:bg-[#161922] border rounded-2xl p-5 space-y-4 transition ${
        isCompliancePassed ? 'border-slate-200 dark:border-white/10 opacity-100' : 'border-slate-100 dark:border-white/5 opacity-50 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-ruby/10 border border-ruby/30 flex items-center justify-center text-ruby">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lên lịch & Phát hành</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Phân phối tới OTT Cinema Catalog</p>
          </div>
        </div>
        {isPublished && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold">
            LIVE TRÊN OTT
          </span>
        )}
      </div>

      {!isCompliancePassed && (
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Cần hoàn tất xác nhận Pháp lý AI phía trên trước khi phát hành.</span>
        </div>
      )}

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">Thời gian công chiếu:</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => onScheduledDateChange(e.target.value)}
            disabled={isPublished}
            className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Kênh phân phối áp dụng:</label>
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                disabled={isPublished}
                onClick={() => onToggleChannel(id)}
                className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                  selectedChannels.includes(id)
                    ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-400 dark:border-purple-500 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">Chế độ hiển thị:</label>
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value as PublicationVisibility)}
            disabled={isPublished}
            className="w-full bg-white dark:bg-[#1e222d] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="public">Công khai toàn bộ khán giả (Public)</option>
            <option value="vip_only">Chỉ dành cho tài khoản VIP (VIP Early Access)</option>
            <option value="unlisted">Không công khai (Chỉ xem qua liên kết)</option>
          </select>
        </div>
      </div>

      {isPublished ? (
        <div className="space-y-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Tập phim đã phát hành công khai trên nền tảng OTT!
          </div>
          <Link
            href={`/watch/${packageId}`}
            className="w-full py-2.5 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-ruby/20"
          >
            <Eye className="w-4 h-4" /> Mở trang xem phim (Watch OTT)
          </Link>
        </div>
      ) : (
        <button
          onClick={onPublish}
          disabled={!isCompliancePassed || isPublishing}
          className="w-full py-3 rounded-xl bg-ruby hover:bg-ruby-dark disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-ruby/25"
        >
          {isPublishing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang đồng bộ và phát hành OTT...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Phát hành lên nền tảng OTT (Publish Content to Platform)
            </>
          )}
        </button>
      )}
    </div>
  );
}
