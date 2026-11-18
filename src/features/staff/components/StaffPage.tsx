'use client';

import { useEffect, useState } from 'react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { movieService, type CatalogMovie } from '@/services/movieService';
import { adminService, type AccountRow } from '@/services/adminService';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { StaffSupportWorkspace } from './StaffSupportWorkspace';

const CARD = 'rounded-xl bg-card ring-1 ring-foreground/10';

/** MF-5 support desk of a Staff account; read-only lookups live on their own page (StaffLookup). */
export function StaffPage() {
  const can = useCan();
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <PageIntro title="Hỗ trợ khách hàng" text="Case do Chatbox AI chuyển sang: nhận case, trả lời Member, báo đã giải quyết để Member xác nhận." />
      {can(PERMISSION.SUPPORT_CASE_READ) ? (
        <StaffSupportWorkspace />
      ) : (
        <p className={`${CARD} p-5 text-xs text-muted-foreground`}>Vai trò của bạn chưa được cấp quyền hỗ trợ khách hàng. Liên hệ Admin.</p>
      )}
    </main>
  );
}

/** Read-only lookups for a Staff account: only the sections its permissions open (BR-21). */
export function StaffLookup() {
  const can = useCan();
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <PageIntro title="Tra cứu (chỉ đọc)" text="Phim đang phát, member, gói thành viên và giao dịch Coin. Điều chỉnh do Admin làm ở màn quản trị." />
      <FilmsSection />
      {can(PERMISSION.MEMBER_OPS_READ) && <MembersSection />}
      {can(PERMISSION.BILLING_SUBSCRIPTION_READ) && <SubscriptionsPanel />}
      {can(PERMISSION.COIN_TRANSACTION_READ) && <CoinLedgerPanel />}
    </main>
  );
}

function PageIntro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function FilmsSection() {
  const [movies, setMovies] = useState<CatalogMovie[] | null>(null);
  useEffect(() => {
    void movieService.getMovies().then((res) => setMovies(res.success ? res.data : []));
  }, []);

  return (
    <section className={`${CARD} overflow-hidden`} aria-label="Theo dõi phim">
      <h2 className="px-5 py-3 text-sm font-semibold text-foreground border-b border-border">Theo dõi phim</h2>
      {movies === null && <p className="p-5 text-xs text-muted-foreground">Đang tải…</p>}
      {movies?.length === 0 && <p className="p-5 text-xs text-muted-foreground">Chưa có phim nào phát hành.</p>}
      <ul className="divide-y divide-border text-xs">
        {movies?.map((movie) => (
          <li key={movie.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">{movie.title}</span>
            <span className="text-muted-foreground">
              {movie.episodeCount} tập · {movie.genres.join(', ') || 'Chưa có thể loại'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MembersSection() {
  const [members, setMembers] = useState<AccountRow[] | null>(null);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    void adminService.listAccounts({ role: 'MEMBER', limit: 50 }).then((res) => {
      setMembers(res.success ? res.data.data : []);
      setTotal(res.success ? res.data.meta.totalItems : 0);
    });
  }, []);

  return (
    <section className={`${CARD} overflow-hidden`} aria-label="Thông tin member">
      <h2 className="px-5 py-3 text-sm font-semibold text-foreground border-b border-border">
        Thông tin member <span className="text-muted-foreground font-normal">({total})</span>
      </h2>
      {members === null && <p className="p-5 text-xs text-muted-foreground">Đang tải…</p>}
      {members?.length === 0 && <p className="p-5 text-xs text-muted-foreground">Chưa có member nào.</p>}
      <ul className="divide-y divide-border text-xs">
        {members?.map((member) => (
          <li key={member.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
            <span>
              <span className="font-medium text-foreground">{member.fullName}</span>
              <span className="text-muted-foreground"> · {member.email}</span>
            </span>
            <span className={member.isActive ? 'text-success' : 'text-destructive'}>
              {member.isActive ? 'Đang hoạt động' : 'Đã khoá'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
