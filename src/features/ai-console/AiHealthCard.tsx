'use client';

import { ErrorNote } from '@/components/data/ui';
import { Badge } from '@/components/ui/Badge';
import { useResource } from '@/hooks/useResource';
import { formatNumber } from '@/lib/format';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { SupportAiHealth } from '@/types/support';

const MODE: Record<SupportAiHealth['mode'], { label: string; tone: 'emerald' | 'amber' | 'rose' }> = {
  live: { label: 'Đang trả lời Member', tone: 'emerald' },
  mock: { label: 'Đang chạy thử, chưa dùng AI thật', tone: 'amber' },
  disabled: { label: 'Đang tắt', tone: 'rose' },
};

/** Whether the AI answers members right now, and whether some articles still wait or failed to be read. */
export function AiHealthCard() {
  const health = useResource('support:ai:health', aiConsoleService.health);
  const h = health.data;
  if (health.error) return <ErrorNote message={health.error} onRetry={health.reload} />;
  if (!h) return <div className="h-12 animate-pulse rounded-xl bg-muted" aria-hidden="true" />;

  const warning =
    h.mode === 'disabled'
      ? 'Trợ lý AI đang tắt: Member được chuyển thẳng cho nhân viên.'
      : h.failedArticles > 0
        ? `${formatNumber(h.failedArticles)} bài AI chưa đọc được. Chọn tình trạng "AI chưa đọc được" ở danh sách bài rồi bấm Thử lại.`
        : null;

  return (
    <section aria-label="Tình trạng Trợ lý AI" className="rounded-xl bg-card px-5 py-3 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium">Trợ lý AI</span>
        <Badge tone={MODE[h.mode].tone} dot>
          {MODE[h.mode].label}
        </Badge>
        {h.pendingArticles > 0 && <span className="text-muted-foreground">{formatNumber(h.pendingArticles)} bài đang chờ AI đọc</span>}
      </div>
      {warning && (
        <p role="alert" className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          {warning}
        </p>
      )}
    </section>
  );
}
