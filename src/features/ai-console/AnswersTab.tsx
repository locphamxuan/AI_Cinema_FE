'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, Panel, TextPromptModal } from '@/components/data/ui';
import { fieldInputClass } from '@/components/ui/FormField';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatNumber } from '@/lib/format';
import { aiConsoleService, type AnswerFilter } from '@/services/aiConsoleService';
import type { AiAnswerLog } from '@/types/support';
import type { ArticleDraft } from './KnowledgeEditorModal';
import { AnswerRow } from './AnswerRow';
import { ConversationModal } from './ConversationModal';

const FILTERS: { key: AnswerFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UNRATED', label: 'Chưa đánh giá' },
  { key: 'NOT_HELPFUL', label: 'Chưa tốt' },
];

/** A weak answer becomes the start of an article: the question as title, the note as what to write. */
export function draftFrom(answer: AiAnswerLog): ArticleDraft {
  const question = answer.question?.trim() || 'Câu hỏi của Member';
  return {
    title: question.slice(0, 200),
    contentMarkdown: `## ${question}\n\n${answer.feedbackNote ? `Cần bổ sung (xoá dòng này trước khi xuất bản): ${answer.feedbackNote}\n\n` : ''}`,
  };
}

/** Every answer the AI gave a member, next to its question, with the Admin's rating of it. */
export function AnswersTab({ onDraftArticle }: { onDraftArticle: (draft: ArticleDraft) => void }) {
  const [filter, setFilter] = useState<AnswerFilter>('ALL');
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<AiAnswerLog | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const summary = useResource('support:ai:summary', aiConsoleService.answerSummary);
  const answers = useResource(`support:ai:answers:${filter}:${search}:${page}`, () => aiConsoleService.listAnswers(page, 20, filter, search));
  const { busy, run } = useAction();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(text.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const rate = async (answer: AiAnswerLog, value: 'HELPFUL' | 'NOT_HELPFUL', note?: string) => {
    if (await run(() => aiConsoleService.rateAnswer(answer.id, value, note), value === 'HELPFUL' ? 'Đã đánh dấu hữu ích' : 'Đã đánh dấu chưa tốt')) {
      setRating(null);
      await Promise.all([answers.reload(), summary.reload()]);
    }
  };

  const s = summary.data;
  return (
    <div className="space-y-5">
      {s && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Câu trả lời AI" value={formatNumber(s.totalAnswers)} />
          <StatCard label="Hữu ích" value={formatNumber(s.helpful)} />
          <StatCard label="Chưa tốt" value={formatNumber(s.notHelpful)} noteTone="bad" />
          <StatCard label="Chưa đánh giá" value={formatNumber(s.unrated)} />
          <StatCard label="Chuyển nhân viên" value={formatNumber(s.handedOffToStaff)} />
          <StatCard label="Member chấm" value={s.averageSatisfaction === null ? '—' : s.averageSatisfaction.toFixed(1)} unit={s.averageSatisfaction === null ? undefined : '/ 5'} />
        </div>
      )}

      <Panel
        title="Lịch sử câu trả lời"
        description="Đánh giá từng câu trả lời AI đã gửi Member. Câu trả lời chưa tốt nên được bổ sung vào Kho tri thức."
        actions={
          <div className="relative w-64">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm trong câu trả lời" aria-label="Tìm câu trả lời" className={`${fieldInputClass} py-1.5 pl-8 text-xs`} />
          </div>
        }
      >
        <div role="tablist" aria-label="Lọc câu trả lời" className="mb-4 grid w-full max-w-md grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs ${filter === f.key ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {answers.error && <ErrorNote message={answers.error} onRetry={answers.reload} />}
        {answers.loading && !answers.data && <Loading />}
        {answers.data?.data.length === 0 && <Empty>Không có câu trả lời nào theo bộ lọc này.</Empty>}
        <ul className="divide-y divide-border">
          {answers.data?.data.map((a) => (
            <AnswerRow
              key={a.id}
              answer={a}
              busy={busy}
              onHelpful={() => void rate(a, 'HELPFUL')}
              onNotHelpful={() => setRating(a)}
              onView={() => setViewing(a.conversationId)}
              onDraft={() => onDraftArticle(draftFrom(a))}
            />
          ))}
        </ul>
        {answers.data && <MetaPager meta={answers.data.meta} onPage={setPage} />}
      </Panel>

      <TextPromptModal
        open={!!rating}
        title="Câu trả lời chưa tốt"
        subtitle={rating?.question ?? undefined}
        label="Cần bổ sung gì vào Kho tri thức?"
        placeholder="Ví dụ: thiếu mốc 24 giờ khi huỷ gói Tháng"
        confirmLabel="Lưu đánh giá"
        required={false}
        busy={busy}
        onClose={() => setRating(null)}
        onConfirm={(note) => rating && void rate(rating, 'NOT_HELPFUL', note)}
      />
      {viewing && <ConversationModal conversationId={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
