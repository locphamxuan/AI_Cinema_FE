'use client';

import { Panel } from '@/components/data/ui';
import { productionPaths } from '@/features/production/lib/routes';
import { TokenRequestList } from './TokenRequestList';

/** The Admin follows every request a Creator sent a Reviewer for more Token; the Reviewer decides. */
export function AdminTokenRequests() {
  return (
    <Panel title="Yêu cầu xin thêm Token" description="Creator gửi khi Studio không nhận mức Token đã cấp. Reviewer của dự án quyết định, Admin theo dõi.">
      <TokenRequestList projectHref={(id) => productionPaths.project('/admin', id, 'studio')} />
    </Panel>
  );
}
