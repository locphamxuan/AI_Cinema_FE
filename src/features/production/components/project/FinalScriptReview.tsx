'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { scriptService } from '@/services/scriptService';
import { studioService } from '@/services/studioService';
import type { ProjectDetail, ProjectScript } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { Panel, TextPromptModal } from '@/components/data/ui';
import { DeadlineList } from './DueDateRows';
import { useProject } from './ProjectContext';

/** What still blocks the Final Script on the backend: episodes planned with a delivery deadline (BE script.service). */
export function finalScriptBlockers(project: Pick<ProjectDetail, 'seasons'>): string[] {
  const episodes = project.seasons.flatMap((s) => s.episodes);
  if (episodes.length === 0) return ['Reviewer chưa lên tập nào cho dự án'];
  const undated = episodes.filter((e) => !e.deliveryDeadline).map((e) => e.episodeNumber);
  return undated.length ? [`tập ${undated.join(', ')} chưa có hạn giao Studio`] : [];
}

/**
 * The Admin reads the script the Reviewer approved and either approves it as the Final Script - picking the
 * studio if the project has none yet, with optional contract terms; the system then sends that studio its
 * template contract - or sends it straight back to the Creator with a reason.
 */
export function FinalScriptReview({ onDecided }: { onDecided: (script: ProjectScript) => void }) {
  const { project } = useProject();
  const studios = useResource('studios:active', () => studioService.list(true));
  const [studioId, setStudioId] = useState(project.studio?.id || '');
  const [terms, setTerms] = useState('');
  const [sendingBack, setSendingBack] = useState(false);
  const { busy, run } = useAction();
  const blockers = finalScriptBlockers(project);
  const studioReady = !!studioId || !!project.studio;
  const episodes = project.seasons.flatMap((s) => s.episodes);

  const approve = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudioId = studioId || project.studio?.id;
    const next = await run(
      () => scriptService.finalReview(project.id, { approve: true, studioId: targetStudioId, terms }),
      'Đã duyệt Kịch bản Final, hợp đồng mẫu đã gửi Studio',
    );
    if (next) onDecided(next);
  };
  const sendBack = async (comment: string) => {
    const next = await run(() => scriptService.finalReview(project.id, { approve: false, comment }), 'Đã yêu cầu Creator sửa kịch bản');
    if (next) {
      setSendingBack(false);
      onDecided(next);
    }
  };

  return (
    <Panel
      title="Duyệt Kịch bản Final"
      description="Đồng ý: kịch bản khoá lại và hệ thống tự gửi hợp đồng mẫu (chưa có giá) cho Studio. Không đồng ý: Creator sửa rồi nộp lại cho Reviewer."
    >
      <form onSubmit={approve} className="space-y-3 text-xs">
        <FormField label="Studio nhận hợp đồng">
          <select value={studioId} onChange={(e) => setStudioId(e.target.value)} required className={fieldInputClass}>
            <option value="">{studios.loading && !studios.data ? 'Đang tải…' : 'Chọn Studio'}</option>
            {studios.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Điều khoản hợp đồng (tuỳ chọn)">
          <textarea
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            maxLength={5000}
            placeholder="Để trống để dùng điều khoản chuẩn của nền tảng."
            className={fieldTextareaClass}
          />
        </FormField>
        {episodes.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Hạn giao Studio của các tập (Reviewer đặt)</p>
            <DeadlineList episodes={episodes} />
          </div>
        )}
        {blockers.length > 0 && (
          <p role="status" className="text-amber-600 dark:text-amber-400">
            Chưa duyệt được: {blockers.join('; ')}. Nhắc Reviewer hoàn tất mùa/tập trước.
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setSendingBack(true)}>
            Yêu cầu sửa
          </Button>
          <Button type="submit" variant="success" disabled={busy || !studioReady || blockers.length > 0}>
            Đồng ý Kịch bản Final
          </Button>
        </div>
      </form>
      <TextPromptModal
        open={sendingBack}
        title="Yêu cầu Creator sửa kịch bản"
        subtitle={project.title}
        label="Lý do / góp ý cho Creator"
        confirmLabel="Gửi yêu cầu sửa"
        minLength={1}
        busy={busy}
        onClose={() => setSendingBack(false)}
        onConfirm={sendBack}
      />
    </Panel>
  );
}
