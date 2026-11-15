'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { DataPagination } from '@/components/data/DataPagination';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useAction } from '@/hooks/useAction';
import { useCan } from '@/hooks/useCan';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { PERMISSION } from '@/lib/permissions';
import { financeService, isPeriodOver, periodLabel, previousPeriod } from '@/services/financeService';
import type { RevenueAllocation } from '@/types/finance';
import { pageOf, vnd, watchTime } from './financeFormat';

const PAGE_SIZE = 20;

/** BR-48: the main Coin paid for the monthly plan in a month, shared between films by members' watch time. */
export function RevenueShareTab() {
  const can = useCan();
  const [period, setPeriod] = useState(previousPeriod);
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [fresh, setFresh] = useState<RevenueAllocation | null>(null);
  const allocation = useResource(`finance:allocation:${period}`, () => financeService.allocation(period));
  const { busy, run } = useAction();

  const data = fresh?.period === period ? fresh : allocation.data;
  const over = isPeriodOver(period);
  const canRun = can(PERMISSION.FINANCE_ALLOCATION_RUN);

  const rerun = async () => {
    const result = await run(() => financeService.runAllocation(period), `Đã chia lại doanh thu tháng ${periodLabel(period)}`);
    setConfirming(false);
    if (result) {
      setFresh(result as RevenueAllocation);
      setPage(1);
    }
  };

  return (
    <div className="space-y-5">
      <Panel
        title={`Chia doanh thu gói Tháng ${periodLabel(period)}`}
        description="Pool là Coin chính Member trả cho gói Tháng trong tháng (giờ Việt Nam), chia cho từng phim theo thời lượng xem của Member gói Tháng. Coin thưởng không tính là doanh thu."
        actions={
          <>
            <input
              type="month"
              value={period}
              max={previousPeriod()}
              onChange={(e) => {
                if (!e.target.value) return;
                setPeriod(e.target.value);
                setPage(1);
              }}
              aria-label="Chọn tháng"
              className={`${fieldInputClass} w-40 py-1.5 text-xs`}
            />
            {canRun && (
              <Button
                size="sm"
                variant="secondary"
                disabled={!over || busy}
                title={over ? undefined : 'Chỉ chia được tháng đã kết thúc'}
                onClick={() => setConfirming(true)}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" /> Chia lại tháng này
              </Button>
            )}
          </>
        }
      >
        {allocation.error && !fresh && <ErrorNote message={allocation.error} onRetry={allocation.reload} />}
        {allocation.loading && !data && <Loading />}
        {data && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Pool gói Tháng" value={vnd(data.monthlyPoolVnd)} />
              <StatCard label="Tổng giờ xem" value={watchTime(data.totalWatchSeconds)} unit="giờ:phút" />
              <StatCard label="Thời điểm chia" value={data.allocatedAt ? formatDateTime(data.allocatedAt) : 'Chưa chia'} />
            </div>
            {!data.allocatedAt && data.movies.length === 0 ? (
              <Empty>Tháng này chưa chia (job chạy đầu tháng, hoặc không có thanh toán gói Tháng).</Empty>
            ) : data.movies.length === 0 ? (
              <Empty>Không có phim nào được Member gói Tháng xem trong tháng này.</Empty>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Phim</th>
                        <th className="py-2 pl-3 text-right font-medium">Giờ xem</th>
                        <th className="py-2 pl-3 text-right font-medium">Tỉ lệ thời lượng</th>
                        <th className="py-2 pl-3 text-right font-medium">Được chia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pageOf(data.movies, page, PAGE_SIZE).map((m) => (
                        <tr key={m.movieId}>
                          <td className="py-2.5 pr-3 font-medium">{m.title}</td>
                          <td className="py-2.5 pl-3 text-right tabular-nums">{watchTime(m.watchSeconds)}</td>
                          <td className="py-2.5 pl-3 text-right tabular-nums">{m.sharePercent}%</td>
                          <td className="py-2.5 pl-3 text-right whitespace-nowrap tabular-nums">{vnd(m.allocatedVnd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataPagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(data.movies.length / PAGE_SIZE))}
                  totalItems={data.movies.length}
                  pageSize={PAGE_SIZE}
                  unit="phim"
                  onChange={setPage}
                />
              </>
            )}
          </div>
        )}
      </Panel>

      <ConfirmModal
        open={confirming}
        title={`Chia lại doanh thu tháng ${periodLabel(period)}?`}
        description="Hệ thống tính lại pool và phần chia của từng phim từ dữ liệu thật, rồi ghi đè kết quả cũ của tháng này."
        confirmLabel="Chia lại"
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={() => void rerun()}
      />
    </div>
  );
}
