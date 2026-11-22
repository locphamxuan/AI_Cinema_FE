import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffSupportWorkspace } from '@/features/staff/components/StaffSupportWorkspace';
import { caseActions } from '@/features/staff/supportLabels';
import { useAppStore } from '@/store/useAppStore';
import { queueQuery } from '@/services/staffSupportService';
import { notificationHref } from '@/features/production/lib/routes';
import { notificationTabsFor, typesOf } from '@/features/notifications/notificationCatalog';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { SupportCase } from '@/types/support';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
let search = new URLSearchParams();
vi.mock('next/navigation', () => ({ useSearchParams: () => search }));
afterEach(() => {
  vi.unstubAllGlobals();
  search = new URLSearchParams();
});

const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

const CASE: SupportCase = {
  id: 'c1', status: 'WAITING_FOR_STAFF', priority: 'HIGH', escalationReason: 'ACCOUNT_VERIFICATION', escalationNote: null,
  aiSummary: 'Member bị trừ 10 Coin hai lần.', memberId: 'u1', memberFullName: 'Nguyễn An', assignedAgentId: null, assignedAgentName: null,
  lastMessageAt: '2026-11-14T00:00:00Z', escalatedAt: '2026-11-14T00:00:00Z', claimedAt: null, resolvedAt: null, closedAt: null,
  resolutionNote: null, satisfactionRating: null, satisfactionComment: null, aiTurns: 3, createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z',
};
const STATS = { byStatus: { WAITING_FOR_STAFF: 1, STAFF_HANDLING: 4 }, waiting: 1, oldestWaiting: { conversationId: 'c1', priority: 'HIGH', waitingMinutes: 12 }, escalatedToday: 3, resolvedToday: 2, aiResolvedRate: 0.625 };
const MESSAGES = [
  { id: 'm1', senderType: 'MEMBER', content: 'Tôi bị trừ Coin hai lần', isInternal: false, aiMetadata: null, createdAt: '2026-11-14T00:00:00Z' },
  { id: 'm2', senderType: 'AI_CHATBOT', content: 'Mình chuyển bạn cho nhân viên.', isInternal: false, aiMetadata: null, createdAt: '2026-11-14T00:01:00Z' },
];

describe('Support queue', () => {
  it('builds the queue filters the backend accepts', () => {
    const q = new URLSearchParams(queueQuery(1, 20, { status: 'WAITING_FOR_STAFF', priority: 'URGENT', assignee: 'NONE' }));
    expect(q.get('filter.status')).toBe('$eq:WAITING_FOR_STAFF');
    expect(q.get('filter.priority')).toBe('$eq:URGENT');
    expect(q.get('filter.assignedAgentId')).toBe('$null');
  });

  it('shows the backend stats and the member name of each case, then claims, drafts with AI and replies', async () => {
    signInAs('staff');
    const calls = routeFetch({
      '/admin/support/stats': STATS,
      '/admin/support/conversations': page([CASE]),
      '/admin/support/conversations/c1': { conversation: CASE, messages: MESSAGES },
      '/admin/support/conversations/c1/claim': { ...CASE, status: 'STAFF_HANDLING' },
      '/admin/support/conversations/c1/ai-suggestion': { draft: 'Chúng tôi đã hoàn 10 Coin cho bạn.', confidence: 0.8, grounded: true, sources: [{ articleId: 'a1', title: 'Hoàn Coin', heading: null }] },
      '/admin/support/conversations/c1/messages': { conversation: CASE, message: MESSAGES[0] },
    });
    render(<StaffSupportWorkspace />);

    expect(await screen.findByText('Lâu nhất 12 phút')).toBeInTheDocument();
    expect(screen.getByText('63%')).toBeInTheDocument();
    const queue = screen.getByRole('region', { name: 'Hàng chờ hỗ trợ' });
    await userEvent.click(await within(queue).findByText('Nguyễn An'));

    const detail = screen.getByRole('region', { name: 'Chi tiết yêu cầu' });
    expect(await within(detail).findByText('Tôi bị trừ Coin hai lần')).toBeInTheDocument();
    expect(within(detail).getByText(/Member bị trừ 10 Coin hai lần/)).toBeInTheDocument();

    await userEvent.click(within(detail).getByRole('button', { name: 'Nhận yêu cầu' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/conversations/c1/claim' && c.method === 'POST')).toBe(true));

    await userEvent.click(within(detail).getByRole('button', { name: /Gợi ý bằng AI/ }));
    const box = within(detail).getByLabelText('Trả lời Member');
    await waitFor(() => expect(box).toHaveValue('Chúng tôi đã hoàn 10 Coin cho bạn.'));
    expect(calls.some((c) => c.path === '/admin/support/conversations/c1/messages')).toBe(false);

    await userEvent.click(within(detail).getByRole('button', { name: /^Gửi$/ }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/conversations/c1/messages')!;
      expect(JSON.parse(sent.body as string)).toEqual({ content: 'Chúng tôi đã hoàn 10 Coin cho bạn.', isInternal: false });
    });
  });

  it('switches between the three queues and resolves a case for the member to confirm', async () => {
    signInAs('staff');
    const handled = { ...CASE, status: 'STAFF_HANDLING', assignedAgentId: useAppStore.getState().user?.id ?? null };
    const calls = routeFetch({
      '/admin/support/stats': STATS,
      '/admin/support/conversations': page([handled]),
      '/admin/support/conversations/c1': { conversation: handled, messages: MESSAGES },
      '/admin/support/conversations/c1/resolve': { ...handled, status: 'RESOLVED' },
      '/admin/support/conversations/c1/release': { ...handled, status: 'WAITING_FOR_STAFF', assignedAgentId: null },
    });
    render(<StaffSupportWorkspace />);
    const queue = screen.getByRole('region', { name: 'Hàng chờ hỗ trợ' });

    await userEvent.click(within(queue).getByRole('button', { name: 'Chờ Member xác nhận' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/conversations' && c.search.get('filter.status') === '$eq:RESOLVED')).toBe(true));
    expect(within(queue).getByRole('button', { name: 'Chờ Member xác nhận' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(within(queue).getByRole('button', { name: 'Của tôi' }));
    await userEvent.click(await within(queue).findByText('Nguyễn An'));

    const detail = screen.getByRole('region', { name: 'Chi tiết yêu cầu' });
    expect(within(detail).queryByRole('button', { name: /Đóng yêu cầu/ })).not.toBeInTheDocument();
    await userEvent.click(await within(detail).findByRole('button', { name: 'Đã giải quyết xong' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Huỷ' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(within(detail).getByRole('button', { name: 'Đã giải quyết xong' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Đã giải quyết xong' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/conversations/c1/resolve' && c.method === 'POST')).toBe(true));
  });

  it('hands a case it holds back to the queue', async () => {
    signInAs('staff');
    const handled = { ...CASE, status: 'STAFF_HANDLING', assignedAgentId: useAppStore.getState().user?.id ?? null };
    const calls = routeFetch({
      '/admin/support/stats': STATS,
      '/admin/support/conversations': page([handled]),
      '/admin/support/conversations/c1': { conversation: handled, messages: MESSAGES },
      '/admin/support/conversations/c1/release': { ...handled, status: 'WAITING_FOR_STAFF', assignedAgentId: null },
    });
    render(<StaffSupportWorkspace />);
    const queue = screen.getByRole('region', { name: 'Hàng chờ hỗ trợ' });
    await userEvent.click(within(queue).getByRole('button', { name: 'Của tôi' }));
    await userEvent.click(await within(queue).findByText('Nguyễn An'));
    const detail = screen.getByRole('region', { name: 'Chi tiết yêu cầu' });
    await userEvent.click(await within(detail).findByRole('button', { name: 'Trả về hàng chờ' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/conversations/c1/release' && c.method === 'POST')).toBe(true));
  });

  it('lets the Admin assign the case to an active Staff member', async () => {
    signInAs('admin');
    search = new URLSearchParams({ case: 'c1' });
    const calls = routeFetch({
      '/admin/support/stats': STATS,
      '/admin/support/conversations': page([CASE]),
      '/admin/support/conversations/c1': { conversation: CASE, messages: MESSAGES },
      '/users': page([{ id: 's1', fullName: 'Trần Bình', email: 'binh@test.vn', role: 'STAFF', isActive: true }]),
      '/admin/support/conversations/c1/assign': CASE,
    });
    render(<StaffSupportWorkspace isAdmin />);

    const detail = screen.getByRole('region', { name: 'Chi tiết yêu cầu' });
    await userEvent.click(await within(detail).findByRole('button', { name: 'Giao cho người khác' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.selectOptions(await within(dialog).findByRole('combobox'), 's1');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Giao yêu cầu' }));

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/conversations/c1/assign')!;
      expect(JSON.parse(sent.body as string)).toEqual({ staffId: 's1' });
    });
  });
});

describe('Case actions follow the backend rules', () => {
  const me = { id: 'staff-id', isAdmin: false, canManage: true, canAssign: false };

  it('claims only a waiting case and resolves only one being handled', () => {
    expect(caseActions(CASE, me)).toMatchObject({ claim: true, resolve: false, release: false, reply: true });
    const mine = { ...CASE, status: 'STAFF_HANDLING' as const, assignedAgentId: 'staff-id' };
    expect(caseActions(mine, me)).toMatchObject({ claim: false, resolve: true, release: true });
    // Staff never closes a case: the member confirms it or it closes on its own.
    expect(caseActions(mine, me)).not.toHaveProperty('close');
  });

  it('blocks Staff on a case another Staff holds, but not the Admin', () => {
    const other = { ...CASE, status: 'STAFF_HANDLING' as const, assignedAgentId: 'someone' };
    expect(caseActions(other, me)).toMatchObject({ reply: false, resolve: false, release: false });
    expect(caseActions(other, { ...me, isAdmin: true, canAssign: true })).toMatchObject({ reply: true, release: true, assign: true });
  });

  it('lets nobody reply while the AI still handles the case', () => {
    expect(caseActions({ ...CASE, status: 'AI_HANDLING' }, me).reply).toBe(false);
  });
});

describe('Support notifications', () => {
  it('opens a support case notification in the desk of the account area', () => {
    expect(notificationHref('/admin/support/conversations/c1', 'staff')).toBe('/staff?case=c1');
    expect(notificationHref('/admin/support/conversations/c1', 'admin')).toBe('/admin/support?case=c1');
  });

  it('gives Staff a support tab and uses the backend codes for change requests', () => {
    expect(notificationTabsFor('staff').flatMap(typesOf)).toEqual(['SUPPORT_CASE_ESCALATED', 'SUPPORT_CASE_ASSIGNED', 'SUPPORT_MEMBER_REPLIED']);
    const admin = notificationTabsFor('admin').flatMap(typesOf);
    expect(admin).toEqual(expect.arrayContaining(['CHANGE_REQUESTED', 'STUDIO_SELECTED', 'EPISODE_RELEASE_FAILED', 'SUPPORT_CASE_ESCALATED']));
    expect(admin).not.toContain('PROJECT_CHANGE_REQUESTED');
    expect(notificationTabsFor('creator').flatMap(typesOf)).toEqual(expect.arrayContaining(['STUDIO_SELECTED', 'CHANGE_RESOLVED']));
  });
});
