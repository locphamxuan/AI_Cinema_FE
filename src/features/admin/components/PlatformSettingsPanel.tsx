import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { NumberField } from '@/features/workflow/components/shared/NumberField';
import { UNLIMITED_EPISODE_MINUTES } from '@/features/workflow/lib/limits';

const MIN_EPISODE_MINUTES = 1;
const FALLBACK_MINUTES = 60;

/** Admin-only production settings: the longest episode Reviewers may allot and Creators may plan. */
export function PlatformSettingsPanel() {
  const { maxEpisodeMinutes, loadPlatformSettings, savePlatformSettings } = useWorkflowStore();
  const [limited, setLimited] = useState(maxEpisodeMinutes !== null);
  const [minutes, setMinutes] = useState(maxEpisodeMinutes ?? FALLBACK_MINUTES);
  const [isSaving, setIsSaving] = useState(false);
  // Follow the value once it loads from the server, without an effect.
  const [shown, setShown] = useState(maxEpisodeMinutes);
  if (maxEpisodeMinutes !== shown) {
    setShown(maxEpisodeMinutes);
    setLimited(maxEpisodeMinutes !== null);
    setMinutes(maxEpisodeMinutes ?? FALLBACK_MINUTES);
  }
  useEffect(() => {
    void loadPlatformSettings();
  }, [loadPlatformSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await savePlatformSettings(limited ? minutes : null);
    setIsSaving(false);
    if (!ok) return;
    toast.success('Đã lưu cài đặt', limited ? `Mỗi tập tối đa ${minutes} phút.` : 'Thời lượng tập không còn giới hạn.');
  };

  return (
    <section className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 space-y-4 max-w-xl">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Cài đặt sản xuất</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Áp dụng cho các dự án tạo và sửa từ bây giờ.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Thời lượng tối đa mỗi tập</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="episode-limit" checked={limited} onChange={() => setLimited(true)} />
            <span className="text-slate-700 dark:text-zinc-300">Giới hạn</span>
            <NumberField
              value={minutes}
              min={MIN_EPISODE_MINUTES}
              max={UNLIMITED_EPISODE_MINUTES}
              disabled={!limited}
              aria-label="Số phút tối đa mỗi tập"
              onCommit={setMinutes}
              className={`${fieldInputClass} w-20 py-1 text-center font-mono`}
            />
            <span className="text-slate-500 dark:text-zinc-400">phút</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="episode-limit" checked={!limited} onChange={() => setLimited(false)} />
            <span className="text-slate-700 dark:text-zinc-300">Không giới hạn</span>
          </label>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Reviewer không giao được tập dài hơn mức này khi tạo dự án. Dự án đã tạo giữ nguyên thời lượng cũ.
          </p>
        </fieldset>

        <div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-white/10">
          <Button type="submit" disabled={isSaving} className="px-4 py-2 rounded-xl text-xs">
            {isSaving ? 'Đang lưu…' : 'Lưu cài đặt'}
          </Button>
        </div>
      </form>
    </section>
  );
}
