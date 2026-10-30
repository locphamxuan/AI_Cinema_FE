'use client';

import { Panel } from '@/features/production/components/shared/ui';
import { productionPaths } from '@/features/production/lib/routes';
import { TokenRequestList } from './TokenRequestList';

/**
 * The Creator's requests for more Token and the answers. A new request is sent from the Studio tab of a
 * project, where the season and the studio's answer are known.
 */
export function TokenRequestsPage() {
  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-5">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Xin thêm Token</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Khi Studio không nhận mức Token đã cấp, gửi yêu cầu từ tab Studio của dự án. Reviewer trả lời và bạn nhận thông báo.
        </p>
      </header>
      <Panel title="Yêu cầu của bạn">
        <TokenRequestList projectHref={(id) => productionPaths.project('/creator', id, 'studio')} />
      </Panel>
    </main>
  );
}
