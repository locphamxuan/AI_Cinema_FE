'use client';

import { useState } from 'react';
import { Panel } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldTextareaClass } from '@/components/ui/FormField';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { PlaygroundAnswer, PlaygroundTurn } from '@/types/support';
import { PlaygroundAnswerCard } from './PlaygroundAnswerCard';

interface Exchange {
  question: string;
  answer: PlaygroundAnswer;
}

/** Earlier exchanges as the backend's `history`, oldest first, at most the last 10 turns. */
export function historyOf(exchanges: Exchange[]): PlaygroundTurn[] {
  return exchanges.flatMap<PlaygroundTurn>((e) => [
    { role: 'MEMBER', content: e.question },
    { role: 'AI', content: e.answer.answer },
  ]).slice(-10);
}

/** Ask the AI as a member would; the backend stores and sends nothing. */
export function PlaygroundTab({ onOpenArticle }: { onOpenArticle: (articleId: string) => void }) {
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = question.trim();
  const valid = text.length >= 2 && text.length <= 1000;

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || asking) return;
    setAsking(true);
    setError(null);
    const res = await aiConsoleService.previewChat(text, historyOf(exchanges));
    setAsking(false);
    if (res.success) {
      setExchanges((list) => [...list, { question: text, answer: res.data }]);
      setQuestion('');
    } else if (res.statusCode === 503 || res.reason === 'AI_UNAVAILABLE') {
      setError('Trợ lý AI đang tắt nên chưa hỏi thử được. Member đang được chuyển thẳng cho nhân viên.');
    } else {
      setError(res.message ?? 'Không hỏi được AI. Thử lại.');
    }
  };

  const reset = () => {
    setExchanges([]);
    setError(null);
  };

  return (
    <Panel
      title="Hỏi thử AI"
      actions={
        <Button size="sm" variant="secondary" onClick={reset} disabled={!exchanges.length || asking}>
          Hỏi lại từ đầu
        </Button>
      }
    >
      <div className="space-y-4">
        {exchanges.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nhập một câu hỏi bên dưới. AI nhớ các câu trước để bạn hỏi tiếp.
          </p>
        )}
        <ol className="space-y-4" aria-label="Các câu đã hỏi thử">
          {exchanges.map((e, i) => (
            <li key={i} className="space-y-2">
              <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">{e.question}</p>
              <PlaygroundAnswerCard answer={e.answer} onOpenArticle={onOpenArticle} />
            </li>
          ))}
        </ol>
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={ask} className="flex items-end gap-2 border-t border-border pt-4">
          <textarea
            rows={2}
            value={question}
            maxLength={1000}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            aria-label="Câu hỏi thử"
            placeholder="Ví dụ: Coin thưởng có hết hạn không?"
            className={fieldTextareaClass}
          />
          <Button type="submit" disabled={!valid || asking}>
            {asking ? 'Đang hỏi…' : 'Hỏi'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Hỏi thử không được lưu và không gửi cho ai. Câu hỏi về tài khoản riêng (ví dụ &ldquo;số dư Coin của tôi&rdquo;) được trả lời bằng tài khoản của bạn.
        </p>
      </div>
    </Panel>
  );
}
