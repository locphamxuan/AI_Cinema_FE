'use client';

import { useState } from 'react';
import { LinkIcon, Repeat, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { Episode, StudioInput } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { DELIVERY_PROJECT, isIn } from '../../lib/capabilities';
import { saveBlob } from '../../lib/format';
import { Empty, ErrorNote, Facts, Loading, Panel } from '../shared/ui';
import { DeadlineList, deadlineUsable } from './DueDateRows';
import { HandoffCard } from './HandoffCard';
import { useProject } from './ProjectContext';

/** Steps 3–4: the Creator sends the brief to an outside studio, due on the Reviewer's deadlines (BR-13, BR-38). */
export function StudioTab() {
  const { project, caps } = useProject();
  const [mode, setMode] = useState<'handoff' | 'change' | null>(null);
  const history = useResource(`handoffs:${project.id}:${project.updatedAt}`, () => productionService.listHandoffs(project.id));
  const episodes = project.seasons.flatMap((s) => s.episodes);
  const delivering = isIn(project.status, DELIVERY_PROJECT);

  const current = history.data?.[0];
  const { busy, run } = useAction();
  // A new link replaces the old one, e.g. when the studio lost the email.
  const resendLink = async () => {
    if (await run(() => productionService.resendPortalLink(project.id), 'Đã gửi link mới; link cũ hết hiệu lực')) await history.reload();
  };

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
              <HandoffCard key={h.id} handoff={h} current={i === 0} onDownload={() => download(h.id)} />
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
            {caps.handoff && delivering && current?.studioResponse === 'DECLINED' && (
              <p className="text-xs text-rose-600">Studio đã từ chối dự án — hãy đổi sang studio khác.</p>
            )}
            {caps.handoff && delivering && current && current.studioResponse !== 'DECLINED' && (
              <Button size="sm" variant="secondary" className="w-full" disabled={busy} onClick={resendLink}>
                <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" /> Gửi lại link cổng studio
              </Button>
            )}
            {caps.handoff && delivering && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setMode('change')}>
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" /> Đổi studio
              </Button>
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

function HandOffModal({ episodes, onClose, onDone }: { episodes: Episode[]; onClose: () => void; onDone: () => Promise<void> }) {
  const { project, reload } = useProject();
  const [studio, setStudio] = useState<StudioInput>({ studioName: '', studioEmail: '', studioContact: '' });
  const { busy, run } = useAction();
  const deadlinesReady = episodes.every(deadlineUsable);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.handOff(project.id, cleanStudio(studio)), 'Đã gửi brief cho studio')) {
      await Promise.all([reload(), onDone()]);
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Bàn giao cho studio" subtitle="Brief PDF (ý tưởng, cấu trúc tập, thời hạn, phí) và link cổng studio được email cho studio." icon={<Send className="w-4 h-4" />} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <StudioFields value={studio} onChange={setStudio} />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Thời hạn từng tập</p>
          <p className="text-[11px] text-slate-500">Studio phải giao đúng thời hạn Reviewer đã đặt; muốn đổi thời hạn hãy báo Reviewer.</p>
          <DeadlineList episodes={episodes} />
          {!deadlinesReady && (
            <p className="text-[11px] text-rose-600">Có tập chưa có thời hạn hoặc thời hạn đã qua — Reviewer cần cập nhật trước khi bàn giao.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !studioValid(studio) || !deadlinesReady}>
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
    <Modal open onClose={onClose} title="Đổi studio" subtitle="Studio mới nhận brief mới với thời hạn Reviewer đã đặt." icon={<Repeat className="w-4 h-4" />}>
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
