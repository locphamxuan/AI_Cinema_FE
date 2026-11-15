'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { DataPagination } from '@/components/data/DataPagination';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { Badge } from '@/components/ui/Badge';
import { fieldInputClass } from '@/components/ui/FormField';
import { useResource } from '@/hooks/useResource';
import { financeService } from '@/services/financeService';
import type { FilmFinance } from '@/types/finance';
import { pageOf, roi, vnd } from './financeFormat';

type SortKey = 'title' | 'productionCostVnd' | 'unlockRevenueVnd' | 'refundedVnd' | 'planShareVnd' | 'revenueVnd' | 'profitVnd' | 'roiPercent';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'productionCostVnd', label: 'Phí sản xuất' },
  { key: 'unlockRevenueVnd', label: 'Doanh thu mở khoá' },
  { key: 'refundedVnd', label: 'Coin hoàn' },
  { key: 'planShareVnd', label: 'Chia từ gói Tháng' },
  { key: 'revenueVnd', label: 'Doanh thu' },
  { key: 'profitVnd', label: 'Lợi nhuận' },
  { key: 'roiPercent', label: 'ROI' },
];

const PAGE_SIZE = 20;

function compare(a: FilmFinance, b: FilmFinance, key: SortKey): number {
  if (key === 'title') return a.title.localeCompare(b.title, 'vi');
  // A film without cost (ROI null) sorts after every film with one.
  return (a[key] ?? Number.NEGATIVE_INFINITY) - (b[key] ?? Number.NEGATIVE_INFINITY);
}

/** Profit and ROI of every film: production cost against unlock revenue and its share of the monthly plan. */
export function FilmProfitTab() {
  const report = useResource('finance:films', financeService.films);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'profitVnd', desc: true });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (report.data?.films ?? []).filter((f) => !q || f.title.toLowerCase().includes(q));
    return [...list].sort((a, b) => compare(a, b, sort.key) * (sort.desc ? -1 : 1));
  }, [report.data, search, sort]);

  const t = report.data?.totals;
  const toggle = (key: SortKey) => {
    setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !report.data && <Loading />}
      {t && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Phí sản xuất" value={vnd(t.productionCostVnd)} />
          <StatCard label="Doanh thu" value={vnd(t.revenueVnd)} />
          <StatCard label="Lợi nhuận" value={vnd(t.profitVnd)} noteTone={t.profitVnd < 0 ? 'bad' : 'good'} note={t.profitVnd < 0 ? 'Đang lỗ' : 'Đang lãi'} />
          <StatCard label="ROI" value={roi(t.roiPercent)} />
          <StatCard label="Phim đã hoà vốn" value={t.breakEvenMovies} unit={`/ ${report.data?.films.length ?? 0} phim`} />
        </div>
      )}

      {report.data && (
        <Panel
          title="Lợi nhuận từng phim"
          description="Doanh thu = doanh thu mở khoá tập (đã trừ Coin hoàn) + phần chia từ gói Tháng."
          actions={
            <div className="relative w-64">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên phim"
                aria-label="Tìm theo tên phim"
                className={`${fieldInputClass} py-1.5 pl-8 text-xs`}
              />
            </div>
          }
        >
          {rows.length === 0 ? (
            <Empty>{search ? 'Không có phim nào khớp tên này.' : 'Chưa có phim nào có chi phí hoặc doanh thu.'}</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <SortHeader label="Phim" active={sort.key === 'title'} desc={sort.desc} onClick={() => toggle('title')} />
                    {COLUMNS.map((c) => (
                      <SortHeader key={c.key} label={c.label} align="right" active={sort.key === c.key} desc={sort.desc} onClick={() => toggle(c.key)} />
                    ))}
                    <th className="py-2 pl-3 text-right font-medium">Hoà vốn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageOf(rows, page, PAGE_SIZE).map((f) => (
                    <tr key={f.movieId}>
                      <td className="py-2.5 pr-3 font-medium">{f.title}</td>
                      <Money value={f.productionCostVnd} />
                      <Money value={f.unlockRevenueVnd} />
                      <Money value={f.refundedVnd} />
                      <Money value={f.planShareVnd} />
                      <Money value={f.revenueVnd} />
                      <Money value={f.profitVnd} warn={f.profitVnd < 0} />
                      <td className={`py-2.5 pl-3 text-right tabular-nums ${f.roiPercent !== null && f.roiPercent < 0 ? 'text-destructive' : ''}`}>
                        {roi(f.roiPercent)}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <Badge tone={f.breakEven ? 'emerald' : 'neutral'}>{f.breakEven ? 'Đã hoà vốn' : 'Chưa'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DataPagination
            page={page}
            totalPages={Math.max(1, Math.ceil(rows.length / PAGE_SIZE))}
            totalItems={rows.length}
            pageSize={PAGE_SIZE}
            unit="phim"
            onChange={setPage}
          />
        </Panel>
      )}
    </div>
  );
}

function Money({ value, warn = false }: { value: number; warn?: boolean }) {
  return <td className={`py-2.5 pl-3 text-right whitespace-nowrap tabular-nums ${warn ? 'font-medium text-destructive' : ''}`}>{vnd(value)}</td>;
}

function SortHeader({ label, active, desc, align = 'left', onClick }: { label: string; active: boolean; desc: boolean; align?: 'left' | 'right'; onClick: () => void }) {
  const Icon = desc ? ArrowDown : ArrowUp;
  return (
    <th className={`py-2 font-medium ${align === 'right' ? 'pl-3 text-right' : 'pr-3'}`} aria-sort={active ? (desc ? 'descending' : 'ascending') : 'none'}>
      <button type="button" onClick={onClick} className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap hover:text-foreground ${active ? 'text-foreground' : ''}`}>
        {label}
        {active && <Icon className="size-3" aria-hidden="true" />}
      </button>
    </th>
  );
}
