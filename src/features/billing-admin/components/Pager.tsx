import { DataPagination } from '@/components/data/DataPagination';
import type { Page } from '@/types/production';

/** Numbered paging under a paged admin table; hidden when everything fits on one page. */
export function Pager({ meta, onPage }: { meta: Page<unknown>['meta']; onPage: (page: number) => void }) {
  return (
    <DataPagination
      page={meta.currentPage}
      totalPages={meta.totalPages ?? 1}
      totalItems={meta.totalItems}
      pageSize={meta.itemsPerPage}
      onChange={onPage}
    />
  );
}
