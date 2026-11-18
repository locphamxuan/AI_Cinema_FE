'use client';

import { useEffect, useState } from 'react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';
import { movieService, type CatalogMovie } from '@/services/movieService';
import { adminService, type AccountRow } from '@/services/adminService';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { StaffSupportWorkspace } from './StaffSupportWorkspace';

interface Module {
  key: string;
  title: string;
  description: string;
  /** None: open to every Staff account (public data). */
  permission?: PermissionKey;
}

const MODULES: Module[] = [
  { key: 'support', title: 'Hỗ trợ khách hàng', description: 'Yêu cầu hỗ trợ do AI Chatbot chuyển sang.', permission: PERMISSION.SUPPORT_CASE_READ },
  { key: 'films', title: 'Theo dõi phim', description: 'Phim đang phát và số tập (chỉ đọc).' },
  { key: 'members', title: 'Thông tin member', description: 'Tài khoản member (chỉ đọc).', permission: PERMISSION.MEMBER_OPS_READ },
];

const CARD = 'rounded-xl bg-card ring-1 ring-foreground/10';

/** Staff operations dashboard (MF-5): only the modules this role holds a permission for (BR-21). */
export function StaffPage() {
  const can = useCan();
  const [activeTab, setActiveTab] = useState<'support' | 'operations'>('support');
  const modules = MODULES.filter((m) => !m.permission || can(m.permission));

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Vận hành</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Hàng chờ hỗ trợ Member và tra cứu chỉ đọc (phim, member, gói, giao dịch Coin).</p>
        </div>

        <div role="tablist" aria-label="Khu vận hành" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm">
          {(['support', 'operations'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`cursor-pointer rounded-md px-4 py-1.5 ${activeTab === key ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {key === 'support' ? 'Hỗ trợ khách hàng' : 'Tra cứu (chỉ đọc)'}
            </button>
          ))}
        </div>
      </div>

      {modules.length === 0 && (
        <p className={`${CARD} p-5 text-xs text-muted-foreground`}>
          Vai trò của bạn chưa được cấp mục vận hành nào. Liên hệ Admin để được cấp quyền.
        </p>
      )}

      {activeTab === 'support' && can(PERMISSION.SUPPORT_CASE_READ) && <StaffSupportWorkspace />}

      {activeTab === 'operations' && (
        <div className="space-y-5">
          <FilmsSection />
          {can(PERMISSION.MEMBER_OPS_READ) && <MembersSection />}
          {can(PERMISSION.BILLING_SUBSCRIPTION_READ) && <SubscriptionsPanel />}
          {can(PERMISSION.COIN_TRANSACTION_READ) && <CoinLedgerPanel />}
        </div>
      )}
    </main>
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
