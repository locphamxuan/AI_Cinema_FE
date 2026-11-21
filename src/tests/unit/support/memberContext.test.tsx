import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberContextPanel } from '@/features/staff/components/MemberContextPanel';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

afterEach(() => vi.unstubAllGlobals());
const future = new Date(Date.now() + 3_600_000).toISOString();
const past = '2026-01-01T00:00:00Z';

const context = (subscription: unknown, wallet: unknown) => ({
  memberId: 'u1',
  sections: {
    Account: { data: { email: 'an@test.vn', fullName: 'An', phoneNumber: null, isActive: false, emailVerifiedAt: null, createdAt: past } },
    Subscription: { data: subscription },
    Wallet: { data: wallet },
    Transactions: { data: [{ entryType: 'EPISODE_UNLOCK', mainAmount: -8, bonusAmount: -2, createdAt: past, description: null }] },
    EpisodeAccess: {
      data: [
        { source: 'EPISODE_PURCHASE', paidCoins: 10, grantedAt: past, revokedAt: null, episode: { episodeNumber: 2, title: 'T2', movie: { title: 'Phim A' } } },
        { source: 'FREE_STARTER', paidCoins: 0, grantedAt: past, revokedAt: past, episode: { episodeNumber: 1, title: 'T1', movie: { title: 'Phim A' } } },
        { source: 'OTHER', paidCoins: 0, grantedAt: past, revokedAt: null, episode: { episodeNumber: 3, title: 'T3', movie: { title: 'Phim A' } } },
      ],
    },
    Devices: { data: { devices: [{ name: null, platform: 'ANDROID', lastSeenAt: null }, { name: 'Pixel', platform: 'IOS', lastSeenAt: past }], sessions: [] } },
    WatchHistory: {
      data: [
        { positionSeconds: 754, durationSeconds: 2700, completed: false, lastWatchedAt: past, episode: { episodeNumber: 3, movie: { title: 'Phim A' } } },
        { positionSeconds: 95, durationSeconds: null, completed: false, lastWatchedAt: past, episode: { episodeNumber: 2, movie: { title: 'Phim A' } } },
        { positionSeconds: 2700, durationSeconds: 2700, completed: true, lastWatchedAt: past, episode: { episodeNumber: 1, movie: { title: 'Phim A' } } },
      ],
    },
  },
});

describe('MemberContextPanel', () => {
  it('reads the member snapshot in plain words: renewal deadline, Coin order, signed amounts, access source', async () => {
    signInAs('staff');
    routeFetch({ '/admin/support/conversations/c1/member-context': context({ status: 'ACTIVE', autoRenew: true, currentPeriodEnd: future, cancelWindowEndsAt: future, priceCoins: 99, plan: { name: 'Gói Tháng' } }, { mainBalance: 10, bonusBalance: 5 }) });
    render(<MemberContextPanel caseId="c1" />);
    expect(await screen.findByText('Đang chạy')).toBeInTheDocument();
    expect(screen.getByText(/^Còn tắt được đến/)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/Coin chính trước, Coin thưởng bù phần thiếu/)).toBeInTheDocument();
    expect(screen.getByText(/-8 chính · -2 thưởng/)).toBeInTheDocument();
    expect(screen.getByText('10 Coin')).toBeInTheDocument();
    expect(screen.getByText('tập miễn phí')).toBeInTheDocument();
    expect(screen.getByText('OTHER')).toBeInTheDocument();
    expect(screen.getByText('Thiết bị (Android)')).toBeInTheDocument();
    expect(screen.getByText('Chưa dùng')).toBeInTheDocument();
    expect(screen.getByText('Pixel (IOS)')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử xem')).toBeInTheDocument();
    expect(screen.getByText('Phim A · tập 3 · Dừng ở 12:34 / 45:00')).toBeInTheDocument();
    expect(screen.getByText('Phim A · tập 2 · Dừng ở 1:35')).toBeInTheDocument();
    expect(screen.getByText('Phim A · tập 1 · Đã xem hết')).toBeInTheDocument();
  });

  it('says when the renewal deadline passed, renewal is off, or there is no plan or wallet', async () => {
    signInAs('staff');
    routeFetch({ '/admin/support/conversations/c2/member-context': context({ status: 'WEIRD', autoRenew: false, currentPeriodEnd: past, cancelWindowEndsAt: past, priceCoins: 99, plan: { name: 'Gói' } }, null) });
    const { unmount } = render(<MemberContextPanel caseId="c2" />);
    expect(await screen.findByText('Đã qua hạn, kỳ sau sẽ bị trừ Coin')).toBeInTheDocument();
    expect(screen.getByText('WEIRD')).toBeInTheDocument();
    expect(screen.getByText('Member chưa có ví.')).toBeInTheDocument();
    unmount();
    routeFetch({ '/admin/support/conversations/c3/member-context': context({ status: 'ACTIVE', autoRenew: false, currentPeriodEnd: past, cancelWindowEndsAt: null, priceCoins: 99, plan: { name: 'Gói' } }, null) });
    render(<MemberContextPanel caseId="c3" />);
    expect(await screen.findByText('Không tự gia hạn')).toBeInTheDocument();
  });
});
