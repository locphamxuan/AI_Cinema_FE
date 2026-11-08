'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scriptService } from '@/services/scriptService';
import type { ProjectScript } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { ErrorNote, Loading, Panel, StatusPill, TextPromptModal } from '@/components/data/ui';
import { SCRIPT_PROJECT, isIn } from '../../lib/capabilities';
import { SCRIPT_STATUS } from '../../lib/labels';
import { FinalScriptReview } from './FinalScriptReview';
import { ScriptEditor } from './ScriptEditor';
import { ScriptHistory } from './ScriptHistory';
import { useProject } from './ProjectContext';

/** What happens next, in words, for whoever opens the tab. */
function nextStep(script: ProjectScript | null): string {
  if (!script) return 'Creator chính chưa nộp kịch bản.';
  switch (script.status) {
    case 'SUBMITTED':
      return `Bản ${script.currentVersion} đang chờ Reviewer phụ trách duyệt.`;
    case 'REVIEWER_APPROVED':
      return `Reviewer đã duyệt bản ${script.currentVersion}; chờ Admin duyệt Kịch bản Final.`;
    case 'REVISION_REQUESTED':
      return 'Kịch bản cần sửa theo góp ý bên dưới; Creator chính nộp bản mới cho Reviewer.';
    case 'FINAL':
      return `Kịch bản Final (bản ${script.currentVersion}) đã khoá; hệ thống đã gửi hợp đồng mẫu cho Studio.`;
  }
}

/** The Reviewer in charge passes the submitted version on to the Admin, or sends it back with a comment. */
function ReviewerActions({ onChanged }: { onChanged: (script: ProjectScript) => void }) {
  const { project } = useProject();
  const [sendingBack, setSendingBack] = useState(false);
  const { busy, run } = useAction();

  const decide = async (approve: boolean, comment?: string) => {
    const next = await run(
      () => scriptService.review(project.id, approve, comment),
      approve ? 'Đã duyệt, chuyển Admin xem Kịch bản Final' : 'Đã gửi yêu cầu sửa cho Creator',
    );
    if (next) {
      setSendingBack(false);
      onChanged(next);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="success" disabled={busy} onClick={() => decide(true)}>
        Duyệt kịch bản
      </Button>
      <Button size="sm" variant="secondary" disabled={busy} onClick={() => setSendingBack(true)}>
        Yêu cầu sửa
      </Button>
      <TextPromptModal
        open={sendingBack}
        title="Yêu cầu sửa kịch bản"
        subtitle={project.title}
        label="Góp ý cho Creator"
        confirmLabel="Gửi yêu cầu sửa"
        minLength={1}
        busy={busy}
        onClose={() => setSendingBack(false)}
        onConfirm={(comment) => decide(false, comment)}
      />
    </div>
  );
}

/**
 * MF-1 §2: the lead Creator writes the script and submits it; the Reviewer in charge approves it or asks for
 * changes (loop); the Admin then approves the Final Script - which sends the studio its template contract - or
 * sends it straight back to the Creator. The Final Script is locked.
 */
export function ScriptTab() {
  const { project, caps, reload } = useProject();
  const script = useResource(`script:${project.id}`, () => scriptService.get(project.id));
  const [current, setCurrent] = useState<ProjectScript | null | undefined>(undefined);
  const data = current !== undefined ? current : script.data;
  const working = isIn(project.status, SCRIPT_PROJECT);
  const status = data?.status ?? null;

  const changed = async (next: ProjectScript) => {
    setCurrent(next);
    await reload();
  };

  if (script.loading && script.data === null && current === undefined) return <Loading label="Đang tải kịch bản…" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-5">
        {script.error && <ErrorNote message={script.error} onRetry={script.reload} />}
        <Panel
          title="Kịch bản"
          description={nextStep(data ?? null)}
          actions={data && <StatusPill {...SCRIPT_STATUS[data.status]} />}
        >
          {data?.status === 'FINAL' && (
            <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Khoá lúc {formatDateTime(data.finalizedAt)} - không sửa được nữa.
            </p>
          )}
          {!working && data?.status !== 'FINAL' && (
            <p className="text-xs text-slate-500">Kịch bản chỉ được viết và duyệt khi dự án đã giao Creator (trạng thái “Đã giao”).</p>
          )}
          {working && caps.review && status === 'SUBMITTED' && <ReviewerActions onChanged={changed} />}
        </Panel>

        {working && caps.scriptWrite && (status === null || status === 'REVISION_REQUESTED') && (
          <ScriptEditor latest={data?.versions[0] ?? null} onSubmitted={changed} />
        )}
        {working && caps.scriptApprove && status === 'REVIEWER_APPROVED' && <FinalScriptReview onDecided={changed} />}
      </div>

      <div className="lg:col-span-2">
        <ScriptHistory script={data ?? null} />
      </div>
    </div>
  );
}
