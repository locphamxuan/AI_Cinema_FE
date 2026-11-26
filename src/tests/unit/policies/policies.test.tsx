import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoliciesPanel } from '@/features/policies/PoliciesPanel';
import { PolicyText } from '@/features/policies/PolicyText';
import { policyState, validity } from '@/features/policies/policyLabels';
import { AppShell } from '@/components/shell/AppShell';
import { policiesQuery } from '@/services/policyService';
import { fromLocalInput, toLocalInput } from '@/features/policies/PolicyFormModal';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import { toast } from '@/components/ui/Toast';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/reviewer/policies',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
afterEach(() => vi.unstubAllGlobals());

const POLICY = {
  id: 'p1', name: 'Quy định gắn nhãn nội dung do AI tạo', type: 'AI_LABELING', version: '1.0.0',
  documentReference: 'Điều 44 Luật số 134/2025/QH15',
  content: 'Mọi tập có phần do AI tạo phải gắn nhãn.\n- Nhãn hiện trên màn hình.\n- Không che nhãn.',
  effectiveFrom: '2026-05-01T00:00:00.000Z', effectiveTo: null, isActive: true,
  createdAt: '2026-09-18T00:00:00.000Z', updatedAt: '2026-11-20T00:00:00.000Z',
};
const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

describe('Policies', () => {
  it('builds the list query the backend accepts, newest change first', () => {
    const q = new URLSearchParams(policiesQuery(2, 20, { search: ' Điều 44 ', type: 'AI_LABELING', active: true }));
    expect(Object.fromEntries(q)).toEqual({
      page: '2', limit: '20', sortBy: 'updatedAt:DESC', search: 'Điều 44', 'filter.type': '$eq:AI_LABELING', 'filter.isActive': '$eq:true',
    });
  });

  it('says how long a policy applies and whether it counts now', () => {
    expect(validity({ effectiveFrom: null, effectiveTo: null })).toBe('Không thời hạn');
    expect(validity({ effectiveFrom: '2026-05-01T00:00:00.000Z', effectiveTo: null })).toBe('01/05/2026 – nay');
    const now = new Date('2026-11-22T00:00:00Z');
    expect(policyState({ isActive: false, effectiveFrom: null, effectiveTo: null }, now).label).toBe('Tắt');
    expect(policyState({ isActive: true, effectiveFrom: null, effectiveTo: null }, now).label).toBe('Đang áp dụng');
    expect(policyState({ isActive: true, effectiveFrom: '2027-01-01T00:00:00Z', effectiveTo: null }, now).label).toBe('Chưa tới ngày áp dụng');
    expect(policyState({ isActive: true, effectiveFrom: null, effectiveTo: '2026-01-01T00:00:00Z' }, now).label).toBe('Hết hạn');
  });

  it('shows plain text with "- " lines as a list, never as HTML', () => {
    render(<PolicyText text={'Đoạn đầu\n- ý một\n- <b>ý hai</b>\n\nĐoạn cuối'} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['ý một', '<b>ý hai</b>']);
    expect(screen.getByText('Đoạn cuối')).toBeInTheDocument();
  });

  it('explains each type and lists title, type in plain words, status and update date', async () => {
    const calls = routeFetch({ '/policies': page([POLICY]) });
    render(<PoliciesPanel />);

    const row = (await screen.findByText('Quy định gắn nhãn nội dung do AI tạo')).closest('tr')!;
    expect(within(row).getByText('Gắn nhãn AI')).toBeInTheDocument();
    expect(within(row).getByText('Đang áp dụng')).toBeInTheDocument();
    expect(within(row).getByText('20/11/2026')).toBeInTheDocument();
    expect(screen.getByText(/Reviewer đối chiếu khi chấm mục "An toàn nội dung"/)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Bản quyền' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Lọc theo loại'), 'LEGAL');
    await waitFor(() => expect(calls.some((c) => c.path === '/policies' && c.search.get('filter.type') === '$eq:LEGAL')).toBe(true));
  });

  it('opens the content as readable text', async () => {
    routeFetch({ '/policies': page([POLICY]) });
    render(<PoliciesPanel />);
    await userEvent.click(await screen.findByRole('button', { name: 'Quy định gắn nhãn nội dung do AI tạo' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Mọi tập có phần do AI tạo phải gắn nhãn.')).toBeInTheDocument();
    expect(within(dialog).getByText('Không che nhãn.')).toBeInTheDocument();
  });

  it('asks before switching a policy off, then sends a PATCH with only isActive', async () => {
    const calls = routeFetch({ '/policies': page([POLICY]), '/policies/p1': { ...POLICY, isActive: false } });
    render(<PoliciesPanel />);
    await userEvent.click(await screen.findByRole('button', { name: 'Tắt' }));
    expect(calls.some((c) => c.method === 'PATCH')).toBe(false);
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tắt' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PATCH' && c.path === '/policies/p1')).toBe(true));
    expect(JSON.parse(String(calls.find((c) => c.method === 'PATCH')!.body))).toEqual({ isActive: false });
  });

  it('shows why the last policy of a type cannot be switched off', async () => {
    routeFetch({
      '/policies': page([POLICY]),
      '/policies/p1': failWith(409, 'This is the only policy of its type in force; add or switch on another one first'),
    });
    render(<PoliciesPanel />);
    await userEvent.click(await screen.findByRole('button', { name: 'Tắt' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tắt' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.anything(), expect.stringMatching(/duy nhất/)));
  });

  it('creates a policy from a text box: trimmed text, empty dates and reference as null', async () => {
    const calls = routeFetch({ '/policies': page([POLICY]) });
    render(<PoliciesPanel />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm chính sách' }));
    const dialog = screen.getByRole('dialog');
    const submit = within(dialog).getByRole('button', { name: 'Thêm chính sách' });
    await userEvent.type(within(dialog).getByLabelText('Tiêu đề'), ' Quy định an toàn ');
    await userEvent.selectOptions(within(dialog).getByLabelText('Loại chính sách'), 'CONTENT_POLICY');
    expect(within(dialog).getByText(/Reviewer đối chiếu khi chấm mục "An toàn nội dung"/)).toBeInTheDocument();
    expect(submit).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Nội dung'), 'Không bạo lực.{enter}- Không khiêu dâm. ');
    await userEvent.click(submit);
    await waitFor(() => expect(calls.some((c) => c.method === 'POST' && c.path === '/policies')).toBe(true));
    expect(JSON.parse(String(calls.find((c) => c.method === 'POST')!.body))).toEqual({
      name: 'Quy định an toàn', type: 'CONTENT_POLICY', version: '1.0', documentReference: null,
      content: 'Không bạo lực.\n- Không khiêu dâm.', effectiveFrom: null, effectiveTo: null, isActive: true,
    });
  });

  it('keeps the filters when nothing matches so they can be cleared', async () => {
    routeFetch({ '/policies': page([]) });
    render(<PoliciesPanel />);
    expect(await screen.findByText('Không có chính sách nào theo bộ lọc này.')).toBeInTheDocument();
    expect(screen.getByLabelText('Lọc theo trạng thái')).toBeInTheDocument();
  });

  it('reads the validity dates the way the backend expects', () => {
    expect(fromLocalInput('')).toBeNull();
    const iso = '2026-05-01T03:30:00.000Z';
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });

  it('puts "Chính sách" in the Reviewer and Admin menus by permission', () => {
    signInAs('reviewer');
    const { unmount } = render(<AppShell area="reviewer"><div /></AppShell>);
    expect(screen.getByRole('link', { name: 'Chính sách' })).toHaveAttribute('aria-current', 'page');
    unmount();

    signInAs('admin', ['platform:settings.manage']);
    render(<AppShell area="admin"><div /></AppShell>);
    expect(screen.getByRole('link', { name: 'Chính sách' })).toHaveAttribute('href', '/admin/policies');
  });
});
