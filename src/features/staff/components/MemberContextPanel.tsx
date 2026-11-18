'use client';

import type { ReactNode } from 'react';
import { ErrorNote, Facts, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { COIN_ENTRY_LABEL, signed } from '@/lib/coinEntry';
import { formatDateTime, formatNumber } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import type { CoinEntryType } from '@/types/billing';
import type { MemberContextSection, MemberContextSectionKey } from '@/types/support';

/* The shapes of BE member-context.service, read only. */
type Account = { email: string; fullName: string; phoneNumber: string | null; isActive: boolean; emailVerifiedAt: string | null; createdAt: string };
type Subscription = { status: string; autoRenew: boolean; currentPeriodEnd: string; cancelWindowEndsAt: string | null; priceCoins: number; plan: { name: string } } | null;
type Wallet = { mainBalance: number; bonusBalance: number; lots?: { source: string; remainingAmount: number; grantedAt: string }[] } | null;
type Tx = { entryType: string; mainAmount: number; bonusAmount: number; createdAt: string; description: string | null };
type Access = { source: string; paidCoins: number; grantedAt: string; revokedAt: string | null; episode: { episodeNumber: number; title: string; movie: { title: string } } };
const SUB_STATUS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  ACTIVE: 'Đang chạy',
  PAST_DUE: 'Gia hạn lỗi',
  CANCELLED: 'Đã huỷ',
  EXPIRED: 'Hết hạn',
};
const ACCESS_SOURCE: Record<string, string> = { EPISODE_PURCHASE: 'mua bằng Coin', FREE_STARTER: 'tập miễn phí', ADMIN_GRANT: 'Admin cấp' };

/** The renewal deadline: until it the member may still turn auto-renew off; after it the next period is charged. */
function cancelWindow(endsAt: string | null): string {
  if (!endsAt) return 'Không tự gia hạn';
  return new Date(endsAt).getTime() > Date.now() ? `Còn tắt được đến ${formatDateTime(endsAt)}` : 'Đã qua hạn, kỳ sau sẽ bị trừ Coin';
}

type Devices = { devices: { name: string | null; platform: string; lastSeenAt: string | null }[]; sessions: { status: string; startedAt: string }[] };

const TITLES: Record<MemberContextSectionKey, string> = {
  Account: 'Tài khoản',
  Subscription: 'Gói thành viên',
  Wallet: 'Ví Coin',
  Transactions: 'Giao dịch Coin gần đây',
  EpisodeAccess: 'Tập đã mở khoá',
  Devices: 'Thiết bị',
};

const ORDER: MemberContextSectionKey[] = ['Account', 'Subscription', 'Wallet', 'Transactions', 'EpisodeAccess', 'Devices'];

function body(key: MemberContextSectionKey, data: unknown): ReactNode {
  switch (key) {
    case 'Account': {
      const a = data as Account;
      return <Facts stacked items={[['Email', a.email], ['Điện thoại', a.phoneNumber ?? '—'], ['Trạng thái', a.isActive ? 'Đang hoạt động' : 'Đã khoá'], ['Xác minh email', a.emailVerifiedAt ? 'Đã xác minh' : 'Chưa'], ['Tham gia', formatDateTime(a.createdAt)]]} />;
    }
    case 'Subscription': {
      const s = data as Subscription;
      if (!s) return 'Không có gói thành viên.';
      return <Facts stacked items={[['Gói', s.plan.name], ['Trạng thái', SUB_STATUS[s.status] ?? s.status], ['Hết kỳ', formatDateTime(s.currentPeriodEnd)], ['Tự gia hạn', s.autoRenew ? 'Có' : 'Không'], ['Hạn tắt tự gia hạn', cancelWindow(s.cancelWindowEndsAt)]]} />;
    }
    case 'Wallet': {
      const w = data as Wallet;
      if (!w) return 'Member chưa có ví.';
      return <Facts stacked items={[['Coin chính', formatNumber(w.mainBalance)], ['Coin thưởng', formatNumber(w.bonusBalance)], ['Tổng có thể dùng', formatNumber(w.mainBalance + w.bonusBalance)], ['Thứ tự trừ', 'Coin chính trước, Coin thưởng bù phần thiếu (không hết hạn)']]} />;
    }
    case 'Transactions':
      return rows((data as Tx[]).map((t) => [`${COIN_ENTRY_LABEL[t.entryType as CoinEntryType] ?? t.entryType}: ${signed(t.mainAmount)} chính · ${signed(t.bonusAmount)} thưởng`, formatDateTime(t.createdAt)]), 'Chưa có giao dịch.');
    case 'EpisodeAccess':
      return rows((data as Access[]).map((x) => [`${x.episode.movie.title} · tập ${x.episode.episodeNumber}${x.revokedAt ? ' (đã thu hồi)' : ''}`, x.paidCoins ? `${x.paidCoins} Coin` : (ACCESS_SOURCE[x.source] ?? x.source)]), 'Chưa mở khoá tập nào.');
    case 'Devices': {
      const d = data as Devices;
      return rows(d.devices.map((x) => [`${x.name ?? 'Thiết bị'} (${x.platform === 'ANDROID' ? 'Android' : x.platform})`, x.lastSeenAt ? `Dùng lần cuối ${formatDateTime(x.lastSeenAt)}` : 'Chưa dùng']), 'Chưa có thiết bị.');
    }
  }
}

function rows(items: [string, string][], empty: string): ReactNode {
  if (!items.length) return empty;
  return (
    <ul className="divide-y divide-border">
      {items.map(([left, right], i) => (
        <li key={i} className="flex justify-between gap-3 py-1.5">
          <span className="min-w-0 truncate">{left}</span>
          <span className="shrink-0 text-muted-foreground">{right}</span>
        </li>
      ))}
    </ul>
  );
}

/** Read-only snapshot of the member; a section the account may not read says so instead of hiding. */
export function MemberContextPanel({ caseId }: { caseId: string }) {
  const ctx = useResource(`staff:support:context:${caseId}`, () => staffSupportService.getMemberContext(caseId));
  if (ctx.error) return <ErrorNote message={ctx.error} onRetry={ctx.reload} />;
  if (!ctx.data) return <Loading />;
  const sections = ctx.data.sections;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ORDER.map((key) => {
        const section: MemberContextSection | undefined = sections[key];
        if (!section) return null;
        return (
          <section key={key} className="rounded-lg border border-border p-3 text-xs" aria-label={TITLES[key]}>
            <h3 className="mb-2 text-sm font-medium">{TITLES[key]}</h3>
            {section.restricted ? <p className="text-muted-foreground">Bạn không có quyền xem mục này.</p> : body(key, section.data)}
          </section>
        );
      })}
      <p className="text-[11px] text-muted-foreground md:col-span-2">Chỉ đọc. Điều chỉnh Coin, gói hay thiết bị do Admin làm ở màn quản trị tương ứng.</p>
    </div>
  );
}
