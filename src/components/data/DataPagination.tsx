'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/shadcn/pagination';
import { cn } from '@/lib/utils';

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** With both, the bar also says which rows are on screen. */
  totalItems?: number;
  pageSize?: number;
  /** What a row is called in "Hiển thị 1–10 trên 42 {unit}". */
  unit?: string;
  className?: string;
}

/** Page numbers to show: the ends, the current page and its neighbours, gaps as null. */
export function pageWindow(page: number, totalPages: number): (number | null)[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

/** Numbered paging under a list; hidden when everything fits on one page. */
export function DataPagination({ page, totalPages, onChange, totalItems, pageSize, unit = 'mục', className }: DataPaginationProps) {
  if (totalPages <= 1) return null;
  const from = totalItems !== undefined && pageSize ? Math.min(totalItems, (page - 1) * pageSize + 1) : null;
  const to = totalItems !== undefined && pageSize ? Math.min(totalItems, page * pageSize) : null;

  return (
    <div className={cn('flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row', className)}>
      {from !== null ? (
        <p className="text-sm text-muted-foreground tabular-nums">
          Hiển thị {from}–{to} trên {totalItems} {unit}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground tabular-nums">
          Trang {page}/{totalPages}
        </p>
      )}
      <Pagination aria-label="Phân trang" className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
              <ChevronLeft />
              <span className="hidden sm:inline">Trước</span>
            </Button>
          </PaginationItem>
          {pageWindow(page, totalPages).map((p, i) => (
            <PaginationItem key={p ?? `gap-${i}`}>
              {p === null ? (
                <PaginationEllipsis />
              ) : (
                <Button
                  variant={p === page ? 'outline' : 'ghost'}
                  size="icon-sm"
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Trang ${p}`}
                  onClick={() => onChange(p)}
                  className="tabular-nums"
                >
                  {p}
                </Button>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
