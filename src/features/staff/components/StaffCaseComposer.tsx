'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldTextareaClass } from '@/components/ui/FormField';
import { useAction } from '@/hooks/useAction';
import { staffSupportService } from '@/services/staffSupportService';
import type { StaffAiSuggestion } from '@/types/support';

type Mode = 'reply' | 'note';

/**
 * Reply to the member or leave an internal note. "Gợi ý bằng AI" drafts a reply into the box from the knowledge
 * base and the member's data; nothing reaches the member until Staff sends it.
 */
export function StaffCaseComposer({ caseId, canSuggest, onSent }: { caseId: string; canSuggest: boolean; onSent: () => Promise<void> }) {
  const [mode, setMode] = useState<Mode>('reply');
  const [content, setContent] = useState('');
  const [suggestion, setSuggestion] = useState<StaffAiSuggestion | null>(null);
  const { busy, run } = useAction({ onStale: onSent });
  const text = content.trim();

  const suggest = async () => {
    const res = await run(() => staffSupportService.getAiSuggestion(caseId));
    if (res) {
      const s = res as StaffAiSuggestion;
      setSuggestion(s);
      setContent(s.draft);
      setMode('reply');
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    const done = await run(() => staffSupportService.sendMessage(caseId, text, mode === 'note'), mode === 'note' ? 'Đã lưu ghi chú nội bộ' : 'Đã gửi cho Member');
    if (done) {
      setContent('');
      setSuggestion(null);
      await onSent();
    }
  };

  return (
    <form onSubmit={send} className="space-y-2 border-t border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <div role="tablist" aria-label="Loại tin" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-xs">
          {(['reply', 'note'] as Mode[]).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`cursor-pointer rounded-md px-3 py-1 ${mode === m ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground'}`}>
              {m === 'reply' ? 'Trả lời Member' : 'Ghi chú nội bộ'}
            </button>
          ))}
        </div>
        {canSuggest && (
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void suggest()}>
            Gợi ý bằng AI
          </Button>
        )}
      </div>

      {suggestion && (
        <p className="text-[11px] text-muted-foreground">
          Bản nháp AI · độ tin cậy {Math.round(suggestion.confidence * 100)}%
          {!suggestion.grounded && ' · không có bài tri thức liên quan, kiểm tra kỹ trước khi gửi'}
          {suggestion.sources.length > 0 && ` · nguồn: ${suggestion.sources.map((s) => s.title).join(', ')}`}
        </p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          rows={3}
          maxLength={4000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label={mode === 'note' ? 'Ghi chú nội bộ' : 'Trả lời Member'}
          placeholder={mode === 'note' ? 'Chỉ nhân viên và Admin đọc được ghi chú này' : 'Nhập câu trả lời cho Member'}
          className={`${fieldTextareaClass} ${mode === 'note' ? 'border-warning/50 bg-warning/5' : ''}`}
        />
        <Button type="submit" disabled={busy || !text}>
          {mode === 'note' ? 'Lưu ghi chú' : 'Gửi'}
        </Button>
      </div>
    </form>
  );
}
