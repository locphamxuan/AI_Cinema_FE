'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { Badge } from '@/components/ui/Badge';
import type { FilmFinance } from '@/types/finance';
import { BREAK_EVEN, day, signTone, vnd } from './financeFormat';

export type SortKey = 'title' | 'productionCostVnd' | 'episodeSalesVnd' | 'revenueVnd' | 'profitVnd';
export interface Sort {
  key: SortKey;
  desc: boolean;
}

/** Each money column with what it means, shown on hover and in the legend above the table. */
export const COLUMNS: { key: Exclude<SortKey, 'title'>; label: string; hint: string }[] = [
  { key: 'productionCostVnd', label: 'Phí sản xuất', hint: 'Tổng chi phí làm phim đã ghi nhận.' },
  { key: 'episodeSalesVnd', label: 'Bán tập lẻ', hint: 'Coin chính Member trả để mở khoá tập, đã trừ Coin hoàn khi tập bị gỡ. Coin thưởng không tính.' },
  { key: 'revenueVnd', label: 'Tổng doanh thu', hint: 'Gồm doanh thu bán tập lẻ và phần phân bổ theo gói Tháng.' },
  { key: 'profitVnd', label: 'Lợi nhuận', hint: 'Tổng doanh thu − Phí sản xuất.' },
];

export function compare(a: FilmFinance, b: FilmFinance, key: SortKey): number {
  if (key === 'title') return a.title.localeCompare(b.title, 'vi') || a.createdAt.localeCompare(b.createdAt);
  return (a[key] ?? Number.NEGATIVE_INFINITY) - (b[key] ?? Number.NEGATIVE_INFINITY);
}

/** One row per film; the studio and creation date under the title tell apart films with the same name. */
export function FilmProfitTable({ rows, sort, onSort }: { rows: FilmFinance[]; sort: Sort; onSort: (key: SortKey) => void }) {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <SortHead label="Phim" sortKey="title" sort={sort} onSort={onSort} />
          {COLUMNS.map((c) => (
            <SortHead key={c.key} label={c.label} hint={c.hint} sortKey={c.key} sort={sort} onSort={onSort} right />
          ))}
          <TableHead className="text-right">Hoà vốn</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((f) => {
          const state = BREAK_EVEN[f.breakEven];
          return (
            <TableRow key={f.movieId}>
              <TableCell className="max-w-64 whitespace-normal">
                <p className="font-medium">{f.title}</p>
                <p className="text-muted-foreground">
                  {[f.studioName, `tạo ngày ${day(f.createdAt)}`].filter(Boolean).join(' · ')}
                </p>
              </TableCell>
              <Money value={f.productionCostVnd} />
              <TableCell className="text-right tabular-nums">
                {vnd(f.episodeSalesVnd)}
                {f.refundedVnd > 0 && <p className="text-muted-foreground">đã trừ hoàn {vnd(f.refundedVnd)}</p>}
              </TableCell>
              <Money value={f.revenueVnd} strong />
              <Money value={f.profitVnd} className={signTone(f.profitVnd)} strong />
              <TableCell className="text-right">
                <Badge tone={state.tone}>{state.label}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function Money({ value, strong = false, className = '' }: { value: number; strong?: boolean; className?: string }) {
  return <TableCell className={`text-right tabular-nums ${strong ? 'font-medium' : ''} ${className}`}>{vnd(value)}</TableCell>;
}

function SortHead({ label, hint, sortKey, sort, onSort, right = false }: { label: string; hint?: string; sortKey: SortKey; sort: Sort; onSort: (key: SortKey) => void; right?: boolean }) {
  const active = sort.key === sortKey;
  const Icon = sort.desc ? ArrowDown : ArrowUp;
  return (
    <TableHead className={right ? 'text-right' : ''} aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}>
      <button
        type="button"
        title={hint}
        onClick={() => onSort(sortKey)}
        className={`inline-flex cursor-pointer items-center gap-1 hover:text-foreground ${active ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {label}
        {active && <Icon className="size-3" aria-hidden="true" />}
      </button>
    </TableHead>
  );
}
