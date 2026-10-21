import { Button } from '@/components/ui/Button';
import type { Page } from '@/types/production';

/** Previous / next under a paged admin table; hidden when everything fits on one page. */
export function Pager({ meta, onPage }: { meta: Page<unknown>['meta']; onPage: (page: number) => void }) {
  const total = meta.totalPages ?? 1;
  if (total <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-end gap-2 pt-3 text-xs text-slate-500">
      <Button size="sm" variant="secondary" disabled={meta.currentPage <= 1} onClick={() => onPage(meta.currentPage - 1)}>
        Trước
      </Button>
      <span>
        {meta.currentPage}/{total}
      </span>
      <Button size="sm" variant="secondary" disabled={meta.currentPage >= total} onClick={() => onPage(meta.currentPage + 1)}>
        Sau
      </Button>
    </nav>
  );
}
