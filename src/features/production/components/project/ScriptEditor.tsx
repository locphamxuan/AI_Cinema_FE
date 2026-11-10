'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { scriptService } from '@/services/scriptService';
import type { ProjectScript, ScriptVersion } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { Panel } from '@/components/data/ui';
import { useProject } from './ProjectContext';

/** BE SubmitScriptRequestDto limits. */
const MAX_CONTENT = 500_000;
const MAX_NOTE = 2000;

/**
 * The lead Creator writes the script as text and submits it to the Reviewer: the first version, or a new one
 * once the Reviewer or the Admin asked for changes (it starts from the latest version).
 */
export function ScriptEditor({ latest, onSubmitted }: { latest: ScriptVersion | null; onSubmitted: (script: ProjectScript) => void }) {
  const { project } = useProject();
  const [content, setContent] = useState(latest?.content ?? '');
  const [note, setNote] = useState('');
  const { busy, run } = useAction();
  const unchanged = latest !== null && content.trim() === latest.content.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = await run(() => scriptService.submit(project.id, content, note), 'Đã nộp kịch bản cho Reviewer');
    if (next) {
      setNote('');
      onSubmitted(next);
    }
  };

  return (
    <Panel
      title={latest ? `Soạn bản ${latest.version + 1}` : 'Soạn kịch bản'}
      description="Viết toàn bộ kịch bản (cảnh, thoại, ghi chú dựng). Nộp xong, Reviewer phụ trách sẽ duyệt hoặc góp ý."
    >
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Nội dung kịch bản">
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT}
            required
            className={`${fieldTextareaClass} font-mono text-xs leading-relaxed`}
            placeholder={'CẢNH 1 - NỘI. CĂN HỘ - ĐÊM\n...'}
          />
        </FormField>
        {latest && (
          <FormField label="Ghi chú thay đổi so với bản trước">
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX_NOTE} className={fieldInputClass} />
          </FormField>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 tabular-nums">{content.length.toLocaleString('vi-VN')} ký tự</p>
          <Button type="submit" disabled={busy || !content.trim() || unchanged}>
            <Send className="w-3.5 h-3.5" aria-hidden="true" /> Nộp cho Reviewer
          </Button>
        </div>
        {unchanged && <p className="text-[11px] text-amber-600">Sửa kịch bản theo góp ý trước khi nộp lại.</p>}
      </form>
    </Panel>
  );
}
