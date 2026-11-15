'use client';

import { useState } from 'react';
import { Eraser, Send } from 'lucide-react';
import { Panel } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { PlaygroundAnswer, PlaygroundTurn, SupportAudience } from '@/types/support';
import { AUDIENCE } from './aiLabels';
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

/** Ask the AI as a member (or as Staff's assistant) would; the backend stores and sends nothing. */
export function PlaygroundTab({ onOpenArticle }: { onOpenArticle: (articleId: string) => void }) {
  const [audience, setAudience] = useState<SupportAudience>('MEMBER');
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
    const res = await aiConsoleService.previewChat(text, historyOf(exchanges), audience);
    setAsking(false);
    if (res.success) {
      setExchanges((list) => [...list, { question: text, answer: res.data }]);
      setQuestion('');
    } else if (res.statusCode === 503 || res.reason === 'AI_UNAVAILABLE') {
      setError('AI đang không khả dụng (đang tắt hoặc chưa cấu hình). Xem thẻ Tình trạng AI ở trên.');
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
      title="Thử nghiệm"
      description="Hỏi AI như Member hỏi để xem câu trả lời, nguồn trích dẫn và các đoạn tìm được. Không lưu và không gửi cho ai."
      actions={
        <>
          <select aria-label="Hỏi với vai trò" value={audience} onChange={(e) => setAudience(e.target.value as SupportAudience)} className={`${fieldInputClass} w-36 py-1.5 text-xs`}>
            {(['MEMBER', 'STAFF'] as SupportAudience[]).map((a) => (
              <option key={a} value={a}>
                Hỏi như {AUDIENCE[a]}
              </option>
            ))}
          </select>
          <Button size="sm" variant="secondary" onClick={reset} disabled={!exchanges.length || asking}>
            <Eraser className="size-3.5" aria-hidden="true" /> Cuộc thử mới
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {exchanges.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nhập một câu hỏi bên dưới. Các lượt trước được gửi kèm để hỏi tiếp.
          </p>
        )}
        <ol className="space-y-4" aria-label="Cuộc thử">
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
            placeholder="Ví dụ: Hủy gói Tháng có được hoàn tiền không?"
            className={fieldTextareaClass}
          />
          <Button type="submit" disabled={!valid || asking}>
            <Send className="size-4" aria-hidden="true" /> {asking ? 'Đang hỏi…' : 'Hỏi'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Công cụ tra cứu tài khoản chạy trên chính tài khoản Admin (không có dữ liệu Member), nên câu như &ldquo;số dư Coin của tôi&rdquo; sẽ
          được trả lời là không có dữ liệu.
        </p>
      </div>
    </Panel>
  );
}
