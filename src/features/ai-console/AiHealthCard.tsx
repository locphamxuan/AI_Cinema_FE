'use client';

import { ErrorNote } from '@/components/data/ui';
import { Badge } from '@/components/ui/Badge';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatNumber } from '@/lib/format';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { SupportAiHealth } from '@/types/support';

const MODE: Record<SupportAiHealth['mode'], { label: string; tone: 'emerald' | 'amber' | 'rose' }> = {
  live: { label: 'Đang chạy', tone: 'emerald' },
  mock: { label: 'Chế độ thử (mock)', tone: 'amber' },
  disabled: { label: 'Đang tắt', tone: 'rose' },
};

/** Whether the AI can answer right now, and how much of the knowledge base it can read. */
export function AiHealthCard() {
  const health = useResource('support:ai:health', aiConsoleService.health);
  const h = health.data;
  if (health.error) return <ErrorNote message={health.error} onRetry={health.reload} />;
  if (!h) return <div className="h-[76px] animate-pulse rounded-xl bg-muted" aria-hidden="true" />;

  const warning =
    h.mode === 'disabled'
      ? 'AI đang tắt: Member được chuyển thẳng cho nhân viên.'
      : h.failedArticles > 0
        ? `${h.failedArticles} bài xuất bản bị lỗi lập chỉ mục nên AI chưa đọc được. Lọc "Lỗi index" ở Kho tri thức để xử lý.`
        : null;

  const facts: [string, string][] = [
    ['Mô hình trả lời', h.chatConfigured ? (h.chatModel ?? '—') : 'Chưa cấu hình'],
    ['Mô hình nhúng', h.embeddingConfigured ? (h.embeddingModel ?? '—') : 'Chưa cấu hình'],
    ['Đoạn đã lập chỉ mục', formatNumber(h.indexedChunks)],
    ['Bài chờ lập chỉ mục', formatNumber(h.pendingArticles)],
    ['Lập chỉ mục gần nhất', formatDateTime(h.lastIndexedAt)],
  ];

  return (
    <section aria-label="Tình trạng AI" className="rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tình trạng AI</span>
          <Badge tone={MODE[h.mode].tone} dot>
            {MODE[h.mode].label}
          </Badge>
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-5">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="truncate font-medium tabular-nums" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {warning && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          {warning}
        </p>
      )}
    </section>
  );
}
