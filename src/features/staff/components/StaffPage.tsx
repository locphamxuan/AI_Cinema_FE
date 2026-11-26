'use client';

import { GreetingCard } from '@/components/data/GreetingCard';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useAppStore } from '@/store/useAppStore';
import { StaffSupportWorkspace } from './StaffSupportWorkspace';

const CARD = 'rounded-xl bg-card ring-1 ring-foreground/10';

/** MF-5 support desk of a Staff account; read-only lookups live on their own page (StaffLookup). */
export function StaffPage() {
  const can = useCan();
  const user = useAppStore((s) => s.user);
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <GreetingCard
        label="Hỗ trợ khách hàng"
        name={user?.name ?? 'Nhân viên'}
        summary="Yêu cầu hỗ trợ do Trợ lý AI chuyển sang: nhận yêu cầu, trả lời Member, báo đã giải quyết để Member xác nhận."
        className="sm:p-7"
      />
      {can(PERMISSION.SUPPORT_CASE_READ) ? (
        <StaffSupportWorkspace />
      ) : (
        <p className={`${CARD} p-5 text-xs text-muted-foreground`}>Vai trò của bạn chưa được cấp quyền hỗ trợ khách hàng. Liên hệ Admin.</p>
      )}
    </main>
  );
}
