'use client';

import { Badge } from '@/components/ui/Badge';
import type { PlaygroundAnswer } from '@/types/support';
import { handsOff } from './aiLabels';

/** One answer of "Hỏi thử AI": the text, whether the AI would hand the case over, and the articles it used. */
export function PlaygroundAnswerCard({ answer: a, onOpenArticle }: { answer: PlaygroundAnswer; onOpenArticle: (articleId: string) => void }) {
  return (
    <div className="max-w-[90%] space-y-2.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
      <p className="whitespace-pre-line leading-relaxed">{a.answer}</p>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge tone={handsOff(a.resolution) ? 'amber' : 'emerald'}>{handsOff(a.resolution) ? 'AI sẽ chuyển cho nhân viên' : 'AI tự trả lời'}</Badge>
        {!a.grounded && <Badge tone="rose">Chưa có bài kiến thức cho câu này, nên thêm bài</Badge>}
      </div>

      {a.sources.length > 0 && (
        <div className="text-xs">
          <p className="font-medium">AI dựa vào bài</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {a.sources.map((s, i) => (
              <li key={`${s.articleId}-${i}`}>
                <button
                  type="button"
                  onClick={() => onOpenArticle(s.articleId)}
                  className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-left hover:border-primary"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
