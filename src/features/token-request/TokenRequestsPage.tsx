'use client';

import { usePathname } from 'next/navigation';
import { Panel } from '@/features/production/components/shared/ui';
import { baseFromPath, productionPaths } from '@/features/production/lib/routes';
import { TokenRequestList } from './TokenRequestList';

/**
 * Creator: the Token they asked for and the answers. Admin: every request, to follow what Reviewers decide.
 * A new request is sent from the Studio tab of a project, where the season and the studio's answer are known.
 */
export function TokenRequestsPage() {
  const base = baseFromPath(usePathname());
  const admin = base === '/admin';
  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="border-b border-slate-200/60 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Yêu cầu thêm Token</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {admin
            ? 'Mọi yêu cầu Creator gửi Reviewer khi Studio không chấp nhận mức Token; Admin theo dõi, Reviewer quyết định.'
            : 'Khi Studio không chấp nhận số Token, gửi yêu cầu từ tab Studio của dự án; Reviewer trả lời và bạn nhận thông báo.'}
        </p>
      </div>
      <Panel title={admin ? 'Tất cả yêu cầu' : 'Yêu cầu của bạn'}>
        <TokenRequestList projectHref={(id) => productionPaths.project(base, id, 'studio')} />
      </Panel>
    </main>
  );
}