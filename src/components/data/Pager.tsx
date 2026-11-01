'use client';

import { DataPagination } from '@/components/data/DataPagination';

/** Numbered paging; hidden when everything fits on one page. */
export function Pager({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  return <DataPagination page={page} totalPages={totalPages} onChange={onChange} className={className} />;
}

/** The slice of `items` on `page` (1-based), for lists the API returns whole. */
export function pageOf<T>(items: T[], page: number, size: number): { rows: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return { rows: items.slice((current - 1) * size, current * size), totalPages };
}