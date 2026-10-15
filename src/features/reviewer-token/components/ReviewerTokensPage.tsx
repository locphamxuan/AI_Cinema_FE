'use client';

import { useResource } from '@/features/production/hooks/useResource';
import { productionPaths } from '@/features/production/lib/routes';
import { ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { reviewerTokenService } from '@/services/reviewerTokenService';
import { TokenHistoryTable, TokenTotalsCards } from './TokenWalletView';

/** The Reviewer's Token: what the Admin granted, what went into production fees, and what is left. */
export function ReviewerTokensPage() {
  const wallet = useResource('reviewer-tokens:me', reviewerTokenService.mine);

  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ví Token Reviewer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ngân sách do Admin phân bổ phục vụ cấp kinh phí sản xuất các dự án phim · Biến động cập nhật theo thời gian thực.
          </p>
        </div>
      </div>
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !wallet.data && <Loading />}
      {wallet.data && (
        <>
          <TokenTotalsCards totals={wallet.data} rateVnd={wallet.data.tokenRateVnd} />
          <Panel title="Lịch sử Token" description="Không sửa, không xoá dòng cũ; nhầm thì Admin hoặc bạn ghi dòng điều chỉnh.">
            <TokenHistoryTable wallet={wallet.data} projectHref={(id) => productionPaths.project('/reviewer', id, 'fee')} />
          </Panel>
        </>
      )}
    </main>
  );
}
