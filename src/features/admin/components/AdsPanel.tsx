'use client';

import { useState } from 'react';
import { Pause, Pencil, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDuration } from '@/features/production/lib/format';
import { adAdminService } from '@/services/adAdminService';
import type { AdInput, AdminAd } from '@/types/playback';
import { AdFormModal } from './AdFormModal';

/** Whether the mid-roll draw can pick the ad: an active ad runs until the Admin pauses it. */
export function adLiveState(ad: AdminAd): { label: string; tone: 'emerald' | 'neutral' } {
  return ad.status === 'ACTIVE' ? { label: 'Đang chạy', tone: 'emerald' } : { label: 'Tạm dừng', tone: 'neutral' };
}

/** MF-3: the ads drawn into mid-roll breaks. The Admin creates them, edits them, pauses and resumes them. */
export function AdsPanel() {
  const ads = useResource('admin:ads', adAdminService.ads);
  const [editing, setEditing] = useState<AdminAd | 'new' | null>(null);
  const { busy, run } = useAction();

  const save = async (input: AdInput) => {
    const call = editing === 'new' || !editing ? () => adAdminService.createAd(input) : () => adAdminService.updateAd(editing.id, input);
    if (await run(call, editing === 'new' ? 'Đã tạo quảng cáo' : 'Đã lưu quảng cáo')) {
      setEditing(null);
      await ads.reload();
    }
  };
  const toggle = async (ad: AdminAd) => {
    const status = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    if (await run(() => adAdminService.updateAd(ad.id, { status }), status === 'PAUSED' ? 'Đã tạm dừng' : 'Đã chạy lại')) await ads.reload();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Quảng cáo</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quảng cáo chèn giữa tập cho gói có quảng cáo. Vị trí chèn từng tập đặt ở <b>Quản lý phim</b> → mở phim → &quot;Đặt vị trí&quot;.
        </p>
      </div>
      <Panel
        title="Danh sách quảng cáo"
        description={ads.data ? `${ads.data.length} quảng cáo · ${ads.data.filter((a) => adLiveState(a).tone === 'emerald').length} đang chạy` : undefined}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-3.5 h-3.5" /> Tạo quảng cáo
          </Button>
        }
      >
        {ads.error && <ErrorNote message={ads.error} onRetry={ads.reload} />}
        {ads.loading && !ads.data && <Loading />}
        {ads.data?.length === 0 && <Empty>Chưa có quảng cáo nào. Tập phim của gói có quảng cáo sẽ không chèn gì.</Empty>}
        <ul className="divide-y divide-slate-100 dark:divide-white/5 -my-3">
          {ads.data?.map((ad) => (
            <li key={ad.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="min-w-0 space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">{ad.title}</p>
                <p className="text-slate-500">
                  Dài {formatDuration(ad.durationSeconds)} · trọng số {ad.weight}
                </p>
                <a href={ad.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline break-all">
                  {ad.mediaUrl}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill {...adLiveState(ad)} />
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(ad)} aria-label={`Sửa ${ad.title}`}>
                  <Pencil className="w-3.5 h-3.5" /> Sửa
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggle(ad)}>
                  {ad.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {ad.status === 'ACTIVE' ? 'Tạm dừng' : 'Chạy lại'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      {editing && <AdFormModal ad={editing === 'new' ? null : editing} busy={busy} onClose={() => setEditing(null)} onSubmit={save} />}
    </div>
  );
}
