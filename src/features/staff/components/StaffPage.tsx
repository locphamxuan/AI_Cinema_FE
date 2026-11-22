'use client';

import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { StaffSupportWorkspace } from './StaffSupportWorkspace';

const CARD = 'rounded-xl bg-card ring-1 ring-foreground/10';

/** MF-5 support desk of a Staff account; read-only lookups live on their own page (StaffLookup). */
export function StaffPage() {
  const can = useCan();
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Hỗ trợ khách hàng</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Yêu cầu hỗ trợ do Trợ lý AI chuyển sang: nhận yêu cầu, trả lời Member, báo đã giải quyết để Member xác nhận.
        </p>
      </div>
      {can(PERMISSION.SUPPORT_CASE_READ) ? (
        <StaffSupportWorkspace />
      ) : (
        <p className={`${CARD} p-5 text-xs text-muted-foreground`}>Vai trò của bạn chưa được cấp quyền hỗ trợ khách hàng. Liên hệ Admin.</p>
      )}
    </main>
  );
}
