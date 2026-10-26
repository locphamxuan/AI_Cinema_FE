import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { featuresSummary, planFormErrors, planFormOf, planInputOf, priceError } from '@/features/billing-admin/lib/planForm';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/tests/support/mockApi';
import { signInAs } from '@/tests/support/signIn';
import type { AdminPlan } from '@/types/billing';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/membership-plans',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const free: AdminPlan = {
  id: 'plan-free',
  code: 'free',
  name: 'Gói Thường',
  description: null,
  period: 'MONTHLY',
  durationDays: 30,
  isFree: true,
  isActive: true,
  sortOrder: 0,
  isFeatured: false,
  features: { maxRegisteredDevices: 2, maxConcurrentStreams: 1, adFree: false, maxQuality: '720p' },
  priceCoins: null,
};

const filled = { ...planFormOf(null), code: 'premium_thang', name: 'Premium Tháng' };

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('plan form rules', () => {
  it('accepts a monthly plan and sends its limits', () => {
    expect(planFormErrors(filled, { creating: true, isFree: false })).toEqual({});
    expect(planInputOf(filled, null)).toEqual({
      code: 'premium_thang',
      period: 'MONTHLY',
      name: 'Premium Tháng',
      description: undefined,
      durationDays: 30,
      sortOrder: 0,
      isFeatured: false,
      features: { maxRegisteredDevices: 2, maxConcurrentStreams: 1, adFree: false, maxQuality: '720p' },
    });
  });

  it('explains every value the BE would refuse', () => {
    const errors = planFormErrors(
      { ...filled, code: 'gói vip', name: ' ', durationDays: '365', sortOrder: '-1', maxRegisteredDevices: '2', maxConcurrentStreams: '3' },
      { creating: true, isFree: false },
    );
    expect(Object.keys(errors).sort()).toEqual(['code', 'durationDays', 'maxConcurrentStreams', 'name', 'sortOrder']);
    expect(errors.maxConcurrentStreams).toBe('Không được nhiều hơn số thiết bị được đăng ký.');
  });

  it('never checks or sends a cycle length for the Free plan, nor a code when editing', () => {
    const form = { ...planFormOf(free), durationDays: '' };
    expect(planFormErrors(form, { creating: false, isFree: true })).toEqual({});
    const input = planInputOf(form, free);
    expect(input).not.toHaveProperty('durationDays');
    expect(input).not.toHaveProperty('code');
    expect(input.features).toEqual(free.features);
  });

  it('sums up what a plan allows', () => {
    expect(featuresSummary(free.features)).toBe('2 thiết bị · xem cùng lúc 1 · có quảng cáo · tối đa 720p');
    expect(featuresSummary(null)).toBe('');
  });

  it('refuses a price out of range or starting in the past', () => {
    const now = Date.parse('2026-10-27T10:00:00');
    expect(priceError('900', '', now)).toBeNull();
    expect(priceError('0', '', now)).toMatch(/từ 1 đến/);
    expect(priceError('100001', '', now)).toMatch(/từ 1 đến/);
    expect(priceError('900', '2026-10-26T10:00', now)).toMatch(/không áp dụng lùi/);
    expect(priceError('900', '2026-11-01T00:00', now)).toBeNull();
  });
});

describe('PlansPanel create', () => {
  it('shows what is wrong before sending, then creates the plan with its limits', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/membership-plans': [free], 'POST /admin/membership-plans': { id: 'p2' } });
    render(<PlansPanel />);

    expect(await screen.findByText('2 thiết bị · xem cùng lúc 1 · có quảng cáo · tối đa 720p')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Thêm gói Tháng/ }));
    await userEvent.type(screen.getByLabelText('Mã gói'), 'gói vip');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo gói' }));
    expect(screen.getByText('Chỉ dùng chữ không dấu, số, dấu _ hoặc -, không có khoảng trắng.')).toBeInTheDocument();
    expect(screen.getByText('Hãy nhập tên gói.')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Mã gói'));
    await userEvent.type(screen.getByLabelText('Mã gói'), 'premium_thang');
    await userEvent.type(screen.getByLabelText('Tên gói'), 'Premium Tháng');
    await userEvent.clear(screen.getByLabelText('Số thiết bị được đăng ký'));
    await userEvent.type(screen.getByLabelText('Số thiết bị được đăng ký'), '4');
    await userEvent.click(screen.getByLabelText('Xem không có quảng cáo giữa tập'));
    await userEvent.click(screen.getByRole('button', { name: 'Tạo gói' }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url, init]) => init?.method === 'POST' && String(url).endsWith('/admin/membership-plans'));
      expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({
        code: 'premium_thang',
        name: 'Premium Tháng',
        features: { maxRegisteredDevices: 4, maxConcurrentStreams: 1, adFree: true },
      });
    });
  });
});
