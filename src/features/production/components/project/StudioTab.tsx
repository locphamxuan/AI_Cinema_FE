'use client';

import { useState } from 'react';
import { CalendarClock, Download, Repeat, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { getTodayDateString } from '@/lib/dateUtils';
import { productionService } from '@/services/productionService';
import type { Episode, StudioInput } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { BEFORE_APPROVAL_EPISODE, DELIVERY_PROJECT, isIn } from '../../lib/capabilities';
import { formatDateTime, formatNumber, saveBlob, toDateInput } from '../../lib/format';
import { Empty, ErrorNote, Facts, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

const EMAIL_STATUS = {
  QUEUED: { label: 'Đang gửi', tone: 'amber' },
  SENT: { label: 'Đã gửi email', tone: 'emerald' },
  FAILED: { label: 'Gửi email lỗi', tone: 'rose' },
} as const;

/** Steps 3–4: the Creator sends the brief to an outside studio and sets when each episode is due (BR-13, BR-38). */
export function StudioTab() {
  const { project, caps } = useProject();
  const [mode, setMode] = useState<'handoff' | 'change' | 'dates' | null>(null);
  const history = useResource(`handoffs:${project.id}:${project.updatedAt}`, () => productionService.listHandoffs(project.id));
  const episodes = project.seasons.flatMap((s) => s.episodes);
  const delivering = isIn(project.status, DELIVERY_PROJECT);

  const download = async (handoffId: string) => {
    const blob = await productionService.downloadBrief(project.id, handoffId);
    if (blob) saveBlob(blob, `brief-${project.title}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel title="Lịch sử bàn giao" description="Mỗi lần bàn giao hoặc đổi studio, hệ thống tạo brief PDF và gửi email cho studio.">
          {history.error && <ErrorNote message={history.error} onRetry={history.reload} />}
          {history.loading && !history.data && <Loading />}
          {history.data?.length === 0 && <Empty>Chưa bàn giao cho studio nào.</Empty>}
          <ol className="space-y-3">
            {history.data?.map((h, i) => (
              <li key={h.id} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {h.studioName} {i === 0 && <Badge tone="purple">Hiện tại</Badge>}
                  </p>
                  <div className="flex items-center gap-2">
                    {h.emailMessage && <Badge tone={EMAIL_STATUS[h.emailMessage.status].tone}>{EMAIL_STATUS[h.emailMessage.status].label}</Badge>}
                    {h.briefFileKey && (
                      <Button size="sm" variant="ghost" onClick={() => download(h.id)}>
                        <Download className="w-3.5 h-3.5" aria-hidden="true" /> Brief
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {h.studioEmail}
                  {h.studioContact && ` · ${h.studioContact}`} · Phí in trong brief: {formatNumber(h.productionFeeTokens)} Token
                </p>
                {h.changeReason && <p className="text-slate-600 dark:text-slate-300">Lý do đổi: {h.changeReason}</p>}
                {h.emailMessage?.errorMessage && <p className="text-rose-600">{h.emailMessage.errorMessage}</p>}
                <p className="text-slate-400">
                  {h.createdBy.fullName} · {formatDateTime(h.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Studio hiện tại">
          {project.studioName ? (
            <Facts
              stacked
              items={[
                ['Studio', project.studioName],
                ['Email', project.studioEmail ?? '—'],
                ['Liên hệ', project.studioContact ?? '—'],
              ]}
            />
          ) : (
            <Empty>Chưa bàn giao.</Empty>
          )}
          <div className="mt-4 space-y-2">
            {caps.handoff && project.status === 'ASSIGNED' && (
              <Button size="sm" className="w-full" onClick={() => setMode('handoff')}>
                <Send className="w-3.5 h-3.5" aria-hidden="true" /> Bàn giao cho studio
              </Button>
            )}
            {caps.handoff && delivering && (
              <>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => setMode('dates')}>
                  <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" /> Đặt / dời hạn giao
                </Button>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => setMode('change')}>
                  <Repeat className="w-3.5 h-3.5" aria-hidden="true" /> Đổi studio
                </Button>
              </>
            )}
            {caps.creator && project.status === 'DRAFT' && <p className="text-xs text-slate-500">Chờ Reviewer hoàn tất kế hoạch.</p>}
            {project.status === 'ASSIGNED' && !caps.handoff && (
              <p className="text-xs text-slate-500">Chờ Content Creator bàn giao cho studio.</p>
            )}
          </div>
        </Panel>
      </div>

      {mode === 'handoff' && <HandOffModal episodes={episodes} onClose={() => setMode(null)} onDone={history.reload} />}
      {mode === 'change' && <ChangeStudioModal onClose={() => setMode(null)} onDone={history.reload} />}
      {mode === 'dates' && <DueDatesModal episodes={episodes.filter((e) => isIn(e.status, BEFORE_APPROVAL_EPISODE))} onClose={() => setMode(null)} />}
    </div>
  );
}

function StudioFields({ value, onChange }: { value: StudioInput; onChange: (v: StudioInput) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormField label="Tên studio">
        <input value={value.studioName} onChange={(e) => onChange({ ...value, studioName: e.target.value })} minLength={2} maxLength={255} required className={fieldInputClass} />
      </FormField>
      <FormField label="Email nhận brief">
        <input type="email" value={value.studioEmail} onChange={(e) => onChange({ ...value, studioEmail: e.target.value })} maxLength={255} required className={fieldInputClass} />
      </FormField>
      <FormField label="Người liên hệ / SĐT (tuỳ chọn)" className="sm:col-span-2">
        <input value={value.studioContact ?? ''} onChange={(e) => onChange({ ...value, studioContact: e.target.value })} maxLength={255} className={fieldInputClass} />
      </FormField>
    </div>
  );
}

function cleanStudio(s: StudioInput): StudioInput {
  return { studioName: s.studioName.trim(), studioEmail: s.studioEmail.trim(), ...(s.studioContact?.trim() ? { studioContact: s.studioContact.trim() } : {}) };
}

const studioValid = (s: StudioInput) => s.studioName.trim().length >= 2 && /\S+@\S+\.\S+/.test(s.studioEmail);

function DueDateRows({ episodes, dates, onChange }: { episodes: Episode[]; dates: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const min = getTodayDateString();
  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      {episodes.map((ep) => (
        <label key={ep.id} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-700 dark:text-slate-200 truncate">
            #{ep.episodeNumber} {ep.title}
          </span>
          <input
            type="date"
            min={min}
            value={dates[ep.id] ?? ''}
            onChange={(e) => onChange({ ...dates, [ep.id]: e.target.value })}
            className={`${fieldInputClass} py-1 w-40`}
            aria-label={`Hạn giao tập ${ep.episodeNumber}`}
          />
        </label>
      ))}
    </div>
  );
}

function HandOffModal({ episodes, onClose, onDone }: { episodes: Episode[]; onClose: () => void; onDone: () => Promise<void> }) {
  const { project, reload } = useProject();
  const [studio, setStudio] = useState<StudioInput>({ studioName: '', studioEmail: '', studioContact: '' });
  const [dates, setDates] = useState<Record<string, string>>(() => Object.fromEntries(episodes.map((e) => [e.id, toDateInput(e.dueDate)])));
  const [fillAll, setFillAll] = useState('');
  const { busy, run } = useAction();
  const allDated = episodes.every((e) => dates[e.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dueDates = episodes.map((ep) => ({ episodeId: ep.id, dueDate: dates[ep.id] }));
    if (await run(() => productionService.handOff(project.id, cleanStudio(studio), dueDates), 'Đã gửi brief cho studio')) {
      await Promise.all([reload(), onDone()]);
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Bàn giao cho studio" subtitle="Brief PDF (ý tưởng, cấu trúc tập, hạn giao, phí) được email cho studio." icon={<Send className="w-4 h-4" />} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <StudioFields value={studio} onChange={setStudio} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Hạn giao từng tập (bắt buộc)</span>
            <div className="flex items-center gap-2">
              <input type="date" min={getTodayDateString()} value={fillAll} onChange={(e) => setFillAll(e.target.value)} className={`${fieldInputClass} py-1 w-40`} aria-label="Hạn chung" />
              <Button type="button" size="sm" variant="secondary" disabled={!fillAll} onClick={() => setDates(Object.fromEntries(episodes.map((ep) => [ep.id, fillAll])))}>
                Áp cho tất cả
              </Button>
            </div>
          </div>
          <DueDateRows episodes={episodes} dates={dates} onChange={setDates} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !studioValid(studio) || !allDated}>
            {busy ? 'Đang gửi…' : 'Gửi brief'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangeStudioModal({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const { project, reload } = useProject();
  const [studio, setStudio] = useState<StudioInput>({ studioName: '', studioEmail: '', studioContact: '' });
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.changeStudio(project.id, cleanStudio(studio), reason.trim()), 'Đã đổi studio và gửi brief mới')) {
      await Promise.all([reload(), onDone()]);
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Đổi studio" subtitle="Studio mới nhận brief mới; hạn giao có thể dời sau." icon={<Repeat className="w-4 h-4" />}>
      <form onSubmit={submit} className="space-y-4">
        <StudioFields value={studio} onChange={setStudio} />
        <FormField label="Lý do đổi studio">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !studioValid(studio) || reason.trim().length < 5}>
            Đổi studio
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DueDatesModal({ episodes, onClose }: { episodes: Episode[]; onClose: () => void }) {
  const { project, reload } = useProject();
  const initial = Object.fromEntries(episodes.map((e) => [e.id, toDateInput(e.dueDate)]));
  const [dates, setDates] = useState<Record<string, string>>(initial);
  const { busy, run } = useAction();
  const changed = episodes.filter((e) => dates[e.id] && dates[e.id] !== initial[e.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dueDates = changed.map((ep) => ({ episodeId: ep.id, dueDate: dates[ep.id] }));
    if (await run(() => productionService.setDueDates(project.id, dueDates), 'Đã cập nhật hạn giao')) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Hạn giao" subtitle="Chỉ các tập chưa được duyệt mới dời được hạn." icon={<CalendarClock className="w-4 h-4" />}>
      <form onSubmit={submit} className="space-y-4">
        {episodes.length === 0 ? <Empty>Không còn tập nào cần hạn giao.</Empty> : <DueDateRows episodes={episodes} dates={dates} onChange={setDates} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || changed.length === 0}>
            Lưu {changed.length > 0 && `(${changed.length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
