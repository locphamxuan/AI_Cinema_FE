'use client';

import { useState } from 'react';
import { Empty } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { RetrievalPreview, SupportAudience } from '@/types/support';
import { AUDIENCE, percent } from './aiLabels';

/** Which articles and passages retrieval finds for a question, without calling the AI. */
export function RetrievalPreviewModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState<SupportAudience>('MEMBER');
  const [result, setResult] = useState<RetrievalPreview | null>(null);
  const { busy, run } = useAction();

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await run(() => aiConsoleService.previewRetrieval(query, audience));
    if (res) setResult(res as RetrievalPreview);
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title="Kiểm tra bài nào được tìm thấy" subtitle="Chỉ thử bước tìm bài, không gọi AI và không lưu gì.">
      <form onSubmit={check} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
        <FormField label="Câu hỏi">
          <input required minLength={2} maxLength={1000} value={query} onChange={(e) => setQuery(e.target.value)} className={fieldInputClass} placeholder="Hủy gói Tháng có được hoàn tiền không?" />
        </FormField>
        <FormField label="Hỏi với vai trò">
          <select value={audience} onChange={(e) => setAudience(e.target.value as SupportAudience)} className={fieldInputClass}>
            {(['MEMBER', 'STAFF'] as SupportAudience[]).map((a) => (
              <option key={a} value={a}>
                {AUDIENCE[a]}
              </option>
            ))}
          </select>
        </FormField>
        <Button type="submit" disabled={busy || query.trim().length < 2}>
          Kiểm tra
        </Button>
      </form>

      {result && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">Tìm thấy {result.totalFound} bài.</p>
          {result.articles.length === 0 && <Empty>Không có bài nào khớp. Nên bổ sung Kho tri thức cho câu hỏi này.</Empty>}
          {result.articles.map((a) => (
            <article key={a.articleId} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{a.title}</p>
              <ul className="mt-2 space-y-2">
                {a.chunks.map((c, i) => (
                  <li key={i} className="text-xs">
                    <p className="flex justify-between gap-3 font-medium">
                      <span>{c.heading ?? 'Đoạn mở đầu'}</span>
                      <span className="tabular-nums text-muted-foreground">Độ khớp {percent(c.score)}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-muted-foreground">{c.content}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}
