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
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Token</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Admin cấp Token cho bạn; mỗi lần bạn cấp phí sản xuất cho một dự án, số Token đó được trừ khỏi số dư. Cần thêm hãy liên hệ Admin.
        </p>
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
