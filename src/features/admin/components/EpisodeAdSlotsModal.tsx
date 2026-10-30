'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDuration } from '@/features/production/lib/format';
import { MAX_AD_SLOTS_PER_EPISODE, adAdminService, adSlotProblem } from '@/services/adAdminService';
import type { EpisodeAdSlotInput, EpisodeAdSlots } from '@/types/playback';

interface Props {
  episode: { id: string; label: string };
  onClose: () => void;
}

const RANDOM_AD = '';

/**
 * BR-32: the Admin places the mid-roll ads of one episode - at which second, and so how many times,
 * each cue optionally pinned to an ad. No cue at all leaves the episode on the platform's random cues.
 */
export function EpisodeAdSlotsModal({ episode, onClose }: Props) {
  const ads = useResource('admin:ads', adAdminService.ads);
  const current = useResource(`admin:ad-slots:${episode.id}`, () => adAdminService.slots(episode.id));
  return (
    <Modal open onClose={onClose} title={`Quảng cáo · ${episode.label}`} subtitle="Chọn giây chèn quảng cáo và số lần chèn trong tập." maxWidth="max-w-xl">
      {(current.error || ads.error) && <ErrorNote message={(current.error || ads.error)!} onRetry={current.error ? current.reload : ads.reload} />}
      {(current.loading || ads.loading) && !(current.data && ads.data) && <Loading />}
      {current.data && ads.data && (
        <SlotsForm
          initial={current.data}
          adOptions={ads.data.filter((a) => a.status === 'ACTIVE').map((a) => ({ value: a.id, label: `${a.title} (${a.durationSeconds}s)` }))}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function SlotsForm({ initial, adOptions, onClose }: { initial: EpisodeAdSlots; adOptions: { value: string; label: string }[]; onClose: () => void }) {
  const [slots, setSlots] = useState<EpisodeAdSlotInput[]>(() =>
    initial.slots.map((s) => ({ positionSeconds: s.positionSeconds, adId: s.ad?.id ?? null })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const duration = initial.durationSeconds;
  const problem = adSlotProblem(slots, duration);
  const options = [{ value: RANDOM_AD, label: 'Ngẫu nhiên theo trọng số' }, ...adOptions];

  const edit = (index: number, patch: Partial<EpisodeAdSlotInput>) =>
    setSlots((all) => all.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const add = () => {
    const last = slots.at(-1)?.positionSeconds ?? 0;
    const next = duration ? Math.min(duration - 1, last + Math.max(60, Math.floor(duration / 4))) : last + 60;
    setSlots((all) => [...all, { positionSeconds: Math.max(1, next), adId: null }]);
  };
  const save = async (list: EpisodeAdSlotInput[]) => {
    setBusy(true);
    setError(null);
    const sorted = [...list].sort((a, b) => a.positionSeconds - b.positionSeconds);
    const res = await adAdminService.saveSlots(initial.episodeId, sorted.map((s) => ({ positionSeconds: s.positionSeconds, adId: s.adId || null })));
    setBusy(false);
    if (res.success) onClose();
    else setError(res.message ?? 'Không lưu được vị trí quảng cáo.');
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Độ dài tập: <b>{duration ? formatDuration(duration) : 'chưa rõ'}</b> · Hiện tại:{' '}
        <b>{initial.mode === 'MANUAL' ? `${initial.slots.length} lần chèn do Admin đặt` : 'chèn ngẫu nhiên theo cài đặt nền tảng'}</b>
      </p>
      {slots.length === 0 && (
        <p className="text-xs text-slate-500 italic">Chưa đặt vị trí nào - tập sẽ được chèn quảng cáo ngẫu nhiên.</p>
      )}
      <ul className="space-y-3">
        {slots.map((slot, index) => (
          <li key={index} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Lần {index + 1}
                <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                  phát lúc <span className="tabular-nums">{formatDuration(slot.positionSeconds || 0)}</span>
                </span>
              </p>
              <button
                type="button"
                onClick={() => setSlots((all) => all.filter((_, i) => i !== index))}
                aria-label={`Bỏ lần chèn ${index + 1}`}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[8rem_minmax(0,1fr)] gap-2.5">
              <div>
                <span className="block mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Giây chèn</span>
                <input
                  type="number"
                  min={1}
                  max={duration ? duration - 1 : undefined}
                  value={slot.positionSeconds}
                  onChange={(e) => edit(index, { positionSeconds: Number(e.target.value) })}
                  aria-label={`Giây chèn lần ${index + 1}`}
                  className={fieldInputClass}
                />
              </div>
              <div className="min-w-0">
                <span className="block mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Quảng cáo</span>
                <Select
                  value={slot.adId ?? RANDOM_AD}
                  onChange={(adId) => edit(index, { adId: adId || null })}
                  options={options}
                  className="w-full"
                  aria-label={`Quảng cáo lần ${index + 1}`}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Button type="button" variant="secondary" size="sm" onClick={add} disabled={slots.length >= MAX_AD_SLOTS_PER_EPISODE}>
        <Plus className="w-3.5 h-3.5" /> Thêm lần chèn
      </Button>
      {(problem || error) && <p role="alert" className="text-xs text-rose-600">{problem || error}</p>}
      <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
        {initial.mode === 'MANUAL' && (
          <Button type="button" variant="secondary" onClick={() => void save([])} disabled={busy}>
            Về chèn ngẫu nhiên
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        <Button type="button" onClick={() => void save(slots)} disabled={busy || !!problem}>
          Lưu vị trí
        </Button>
      </div>
    </div>
  );
}
