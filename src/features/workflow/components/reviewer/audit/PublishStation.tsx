import Link from 'next/link';
import type { PublicationVisibility } from '@/types/workflow';

const CHANNELS = [
  { id: 'WEB_OTT', label: 'Web' },
  { id: 'MOBILE_APP', label: 'Ứng dụng di động' },
  { id: 'SMART_TV', label: 'Smart TV' },
] as const;

const FIELD_CLASS =
  'w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:opacity-60';

export interface PublishStationProps {
  packageId: string;
  isCompliancePassed: boolean;
  /** The account may schedule and publish (movie:publish). */
  canPublish: boolean;
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

/** Step 2 of the video audit: schedule and release the episode. Locked until step 1 is signed off. */
export function PublishStation({
  packageId,
  isCompliancePassed,
  canPublish,
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
  const isLocked = !isCompliancePassed || isPublished || !canPublish;

  return (
    <section aria-labelledby="publish-title" className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="publish-title" className="text-sm font-semibold text-slate-900 dark:text-white">
          <span className="text-slate-400 font-normal mr-1.5">2.</span>Phát hành
        </h2>
        {isPublished && (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Đã phát hành
          </span>
        )}
      </div>

      {!isCompliancePassed && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Xác nhận kiểm định pháp lý ở bước 1 để mở bước này.</p>}

      <fieldset disabled={isLocked} className="mt-4 space-y-4 disabled:opacity-60 min-w-0">
        <div>
          <label htmlFor="publish-time" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Thời gian công chiếu
          </label>
          <input id="publish-time" type="datetime-local" value={scheduledDate} onChange={(e) => onScheduledDateChange(e.target.value)} className={FIELD_CLASS} />
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phát trên</span>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(({ id, label }) => {
              const isOn = selectedChannels.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => onToggleChannel(id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                    isOn
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="publish-visibility" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Ai được xem
          </label>
          <select id="publish-visibility" value={visibility} onChange={(e) => onVisibilityChange(e.target.value as PublicationVisibility)} className={FIELD_CLASS}>
            <option value="public">Tất cả khán giả</option>
            <option value="vip_only">Thành viên VIP xem sớm</option>
            <option value="unlisted">Chỉ người có liên kết</option>
          </select>
        </div>
      </fieldset>

      {isPublished ? (
        <Link
          href={`/watch/${packageId}`}
          className="mt-5 w-full py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center transition"
        >
          Xem trên nền tảng
        </Link>
      ) : (
        <button
          type="button"
          onClick={onPublish}
          disabled={isLocked || isPublishing}
          className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
        >
          {isPublishing ? 'Đang phát hành…' : 'Phát hành'}
        </button>
      )}
    </section>
  );
}
