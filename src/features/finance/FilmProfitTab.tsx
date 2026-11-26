'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { DataPagination } from '@/components/data/DataPagination';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { fieldInputClass } from '@/components/ui/FormField';
import { useResource } from '@/hooks/useResource';
import { financeService, periodLabel } from '@/services/financeService';
import type { FilmFinanceReport } from '@/types/finance';
import { COLUMNS, FilmProfitTable, compare, type Sort, type SortKey } from './FilmProfitTable';
import { pageOf, roi, vnd } from './financeFormat';

const PAGE_SIZE = 20;

/** Plain words on which months the monthly-plan column covers: only months already shared, never the running one. */
export function planCoverage(report: Pick<FilmFinanceReport, 'currentPeriod' | 'lastSharedPeriod'>): string {
  const running = `Tháng ${periodLabel(report.currentPeriod)} đang diễn ra, phần gói Tháng của nó sẽ được chia tự động vào đầu tháng sau.`;
  return report.lastSharedPeriod
    ? `"Từ gói Tháng" gồm các tháng đã chia, gần nhất là tháng ${periodLabel(report.lastSharedPeriod)}. ${running}`
    : `Chưa có tháng nào được chia tiền gói Tháng. ${running}`;
}

/** One profit view per film: production cost against revenue from selling episodes and from the monthly plan. */
export function FilmProfitTab() {
  const report = useResource('finance:films', financeService.films);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'profitVnd', desc: true });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (report.data?.films ?? []).filter((f) => !q || f.title.toLowerCase().includes(q) || f.studioName?.toLowerCase().includes(q));
    return [...list].sort((a, b) => compare(a, b, sort.key) * (sort.desc ? -1 : 1));
  }, [report.data, search, sort]);

  const data = report.data;
  const t = data?.totals;
  const toggle = (key: SortKey) => {
    setSort((s) => ({ key, desc: s.key === key ? !s.desc : key !== 'title' }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !data && <Loading />}
      {t && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Phí sản xuất" value={vnd(t.productionCostVnd)} note={`${t.costedMovies} phim đã có chi phí`} />
          <StatCard
            label="Tổng doanh thu"
            value={vnd(t.revenueVnd)}
            note={`Bán tập lẻ ${vnd(t.episodeSalesVnd)} · Gói Tháng ${vnd(t.planShareVnd)}`}
          />
          <StatCard
            label="Lợi nhuận"
            value={vnd(t.profitVnd)}
            noteTone={t.profitVnd < 0 ? 'bad' : t.profitVnd > 0 ? 'good' : 'muted'}
            note={`Biên lợi nhuận ${roi(t.marginPercent)} · ROI ${roi(t.roiPercent)}`}
          />
          <StatCard
            label="Phim đã hoà vốn"
            value={t.brokeEvenMovies}
            unit={`/ ${t.costedMovies} phim`}
            note={t.costedMovies === 0 ? 'Chưa phim nào có chi phí' : 'Chỉ tính phim đã có chi phí'}
          />
        </div>
      )}

      {data && (
        <Panel
          title="Lợi nhuận từng phim"
          description={
            <>
              Tổng doanh thu = Bán tập lẻ + Từ gói Tháng. Lợi nhuận = Tổng doanh thu − Phí sản xuất. {planCoverage(data)}
            </>
          }
          actions={
            <div className="relative w-64">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên phim hoặc studio"
                aria-label="Tìm theo tên phim hoặc studio"
                className={`${fieldInputClass} py-1.5 pl-8 text-xs`}
              />
            </div>
          }
        >
          <dl className="mb-4 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            {COLUMNS.slice(1, 3).map((c) => (
              <div key={c.key} className="flex gap-1.5">
                <dt className="shrink-0 font-medium">{c.label}:</dt>
                <dd className="text-muted-foreground">{c.hint}</dd>
              </div>
            ))}
          </dl>
          {rows.length === 0 ? (
            <Empty>{search ? 'Không có phim nào khớp tìm kiếm này.' : 'Chưa có phim nào.'}</Empty>
          ) : (
            <>
              <FilmProfitTable rows={pageOf(rows, page, PAGE_SIZE)} sort={sort} onSort={toggle} />
              <DataPagination
                page={page}
                totalPages={Math.max(1, Math.ceil(rows.length / PAGE_SIZE))}
                totalItems={rows.length}
                pageSize={PAGE_SIZE}
                unit="phim"
                onChange={setPage}
              />
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
