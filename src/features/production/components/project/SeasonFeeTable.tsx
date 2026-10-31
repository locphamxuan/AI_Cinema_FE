'use client';

import { Button } from '@/components/ui/Button';
import { seasonLabel } from '@/lib/seasonLabel';
import type { SeasonFee } from '@/types/production';
import { formatNumber } from '@/lib/format';
import { Empty } from '@/components/data/ui';

/** What each season costs (price × episodes) against what was paid out, with the "+… Token thêm" so far (BR-37, BR-46). */
export function SeasonFeeTable({
  seasons,
  canAllocate,
  busy,
  onAllocate,
  onTopUp,
}: {
  seasons: SeasonFee[];
  canAllocate: boolean;
  busy: boolean;
  onAllocate: (season: SeasonFee) => void;
  /** Opens the top-up form for the season with the missing Token filled in. */
  onTopUp: (season: SeasonFee) => void;
}) {
  if (seasons.length === 0) return <Empty>Dự án chưa có mùa.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-slate-500 dark:text-slate-400 text-left">
          <tr>
            <th className="py-2 font-medium">Mùa</th>
            <th className="py-2 font-medium text-right">Đơn giá/tập</th>
            <th className="py-2 font-medium text-right">Tập</th>
            <th className="py-2 font-medium text-right">Định mức</th>
            <th className="py-2 font-medium text-right">Đã cấp</th>
            <th className="py-2 font-medium text-right">+ Token thêm</th>
            <th className="py-2 font-medium text-right">Còn thiếu</th>
            <th className="py-2 font-medium text-right" title="Token đã gửi cho Studio cũ, mất khi đổi Studio (không hoàn)">
              Mất do đổi Studio
            </th>
            <th className="py-2 font-medium text-right" title="Số Token brief mới của mùa còn ghi được">
              Còn dùng được
            </th>
            <th className="py-2 w-28" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {seasons.map((season) => (
            <tr key={season.seasonId}>
              <td className="py-2 text-slate-800 dark:text-slate-100">
                {seasonLabel(season.seasonNumber, season.episodeCount, season.title)}
              </td>
              <td className="py-2 text-right">{formatNumber(season.episodeProductionCost)}</td>
              <td className="py-2 text-right">{season.episodeCount}</td>
              <td className="py-2 text-right">{formatNumber(season.baselineTokens)}</td>
              <td className="py-2 text-right tabular-nums text-emerald-600">{formatNumber(season.allocatedTokens)}</td>
              <td className="py-2 text-right tabular-nums text-emerald-600">{season.supplementTokens ? `+${formatNumber(season.supplementTokens)}` : '-'}</td>
              <td className={`py-2 text-right tabular-nums ${season.missingTokens ? 'text-amber-600' : 'text-slate-400'}`}>{formatNumber(season.missingTokens)}</td>
              <td className={`py-2 text-right tabular-nums ${season.lostTokens ? 'text-rose-600' : 'text-slate-400'}`}>
                {season.lostTokens ? `-${formatNumber(season.lostTokens)}` : '-'}
              </td>
              <td className={`py-2 text-right tabular-nums ${season.availableTokens ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600'}`}>
                {formatNumber(season.availableTokens)}
              </td>
              <td className="py-2 text-right">
                {canAllocate && !season.hasInitial && season.episodeProductionCost > 0 && season.episodeCount > 0 && (
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => onAllocate(season)}>
                    Cấp phí mùa
                  </Button>
                )}
                {canAllocate && season.hasInitial && (season.missingTokens > 0 || season.availableTokens === 0) && (
                  <Button size="sm" variant="secondary" onClick={() => onTopUp(season)}>
                    Cấp thêm
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
