'use client';

import { useEffect, useState } from 'react';
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
    contentMarkdown: `## ${question}\n\n${answer.feedbackNote ? `Cần bổ sung (xoá dòng này trước khi lưu): ${answer.feedbackNote}\n\n` : ''}`,
  };
}

/** Every answer the AI gave a member, next to its question, with the Admin's rating of it and a short tally. */
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
    if (await run(() => aiConsoleService.rateAnswer(answer.id, value, note), value === 'HELPFUL' ? 'Đã đánh dấu tốt' : 'Đã đánh dấu chưa tốt')) {
      setRating(null);
      await Promise.all([answers.reload(), summary.reload()]);
    }
  };

  const s = summary.data;
  return (
    <Panel
      title="Câu trả lời của AI"
      actions={
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tìm trong câu hỏi, câu trả lời"
          aria-label="Tìm câu trả lời"
          className={`${fieldInputClass} w-64 py-1.5 text-xs`}
        />
      }
    >
      {s && (
        <p className="mb-4 text-sm text-muted-foreground">
          {formatNumber(s.totalAnswers)} câu trả lời · {formatNumber(s.unrated)} chưa đánh giá · {formatNumber(s.notHelpful)} chưa tốt ·{' '}
          {formatNumber(s.handedOffToStaff)} chuyển cho nhân viên
        </p>
      )}
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

      <TextPromptModal
        open={!!rating}
        title="Câu trả lời chưa tốt"
        subtitle={rating?.question ?? undefined}
        label="Bài kiến thức cần bổ sung gì?"
        placeholder="Ví dụ: thiếu mốc 24 giờ khi tắt tự gia hạn gói Tháng"
        confirmLabel="Lưu đánh giá"
        required={false}
        busy={busy}
        onClose={() => setRating(null)}
        onConfirm={(note) => rating && void rate(rating, 'NOT_HELPFUL', note)}
      />
      {viewing && <ConversationModal conversationId={viewing} onClose={() => setViewing(null)} />}
    </Panel>
  );
}
