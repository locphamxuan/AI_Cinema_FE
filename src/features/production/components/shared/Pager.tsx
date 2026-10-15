'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Page x/y with previous / next; hidden when everything fits on one page. */
export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-end gap-2 pt-3 text-xs text-slate-500">
      <span>
        Trang {page}/{totalPages}
      </span>
      <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft className="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </nav>
  );
}

/** The slice of `items` on `page` (1-based), for lists the API returns whole. */
export function pageOf<T>(items: T[], page: number, size: number): { rows: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return { rows: items.slice((current - 1) * size, current * size), totalPages };
}