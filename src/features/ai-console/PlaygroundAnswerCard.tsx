'use client';

import { Badge } from '@/components/ui/Badge';
import type { PlaygroundAnswer } from '@/types/support';
import { handsOff, percent } from './aiLabels';

/** One AI answer of the Playground: the text, what it relied on, and whether it would hand the case over. */
export function PlaygroundAnswerCard({ answer: a, onOpenArticle }: { answer: PlaygroundAnswer; onOpenArticle: (articleId: string) => void }) {
  return (
    <div className="max-w-[90%] space-y-2.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
      <p className="whitespace-pre-line leading-relaxed">{a.answer}</p>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge tone={handsOff(a.resolution) ? 'amber' : 'emerald'}>{handsOff(a.resolution) ? 'AI sẽ chuyển cho nhân viên' : 'AI tự trả lời'}</Badge>
        {!a.grounded && <Badge tone="rose">Không tìm thấy bài liên quan — nên bổ sung Kho tri thức</Badge>}
        <span className="text-muted-foreground">
          Độ tin cậy {percent(a.confidence)} · {a.latencyMs} ms{a.model ? ` · ${a.model}` : ''}
          {a.toolsUsed.length > 0 && ` · Công cụ: ${a.toolsUsed.join(', ')}`}
        </span>
      </div>

      {a.sources.length > 0 && (
        <div className="text-xs">
          <p className="font-medium">Nguồn trích dẫn</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {a.sources.map((s, i) => (
              <li key={`${s.articleId}-${i}`}>
                <button
                  type="button"
                  onClick={() => onOpenArticle(s.articleId)}
                  className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-left hover:border-primary"
                >
                  {s.title}
                  {s.heading && <span className="text-muted-foreground"> / {s.heading}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.retrieved.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">Các đoạn tìm được ({a.retrieved.length})</summary>
          <ul className="mt-2 space-y-2">
            {a.retrieved.map((r) => (
              <li key={`${r.articleId}-${r.chunkIndex}`} className="rounded-md bg-background p-2">
                <p className="flex justify-between gap-3 font-medium">
                  <span>
                    {r.title}
                    {r.heading && <span className="text-muted-foreground"> / {r.heading}</span>}
                  </span>
                  <span className="tabular-nums text-muted-foreground">Độ khớp {percent(r.score)}</span>
                </p>
                <p className="mt-0.5 text-muted-foreground">{r.excerpt}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
