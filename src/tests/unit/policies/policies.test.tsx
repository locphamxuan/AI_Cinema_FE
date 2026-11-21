import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoliciesPanel } from '@/features/policies/PoliciesPanel';
import { validity } from '@/features/policies/policyLabels';
import { AppShell } from '@/components/shell/AppShell';
import { policiesQuery } from '@/services/policyService';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/reviewer/policies',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
afterEach(() => vi.unstubAllGlobals());

const POLICY = {
  id: 'p1', name: 'Chính sách gắn nhãn nội dung AI', type: 'AI_LABELING', version: '1.0.0',
  documentReference: 'Điều 44 Luật số 134/2025/QH15 và Điều 18 Nghị định số 142/2026/NĐ-CP',
  content: { requiredLabelText: 'Nội dung do AI tạo', placements: ['Đầu video', 'Góc màn hình'], mandatory: true },
  effectiveFrom: '2026-05-01T00:00:00.000Z', effectiveTo: null, isActive: true, createdAt: '2026-09-18T00:00:00.000Z',
};
const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

describe('Policies', () => {
  it('builds the list query the backend accepts', () => {
    const q = new URLSearchParams(policiesQuery(2, 20, { search: ' Điều 44 ', type: 'AI_LABELING', active: true }));
    expect(Object.fromEntries(q)).toEqual({
      page: '2', limit: '20', sortBy: 'name:ASC', search: 'Điều 44', 'filter.type': '$eq:AI_LABELING', 'filter.isActive': '$eq:true',
    });
  });

  it('says how long a policy applies', () => {
    expect(validity({ effectiveFrom: null, effectiveTo: null })).toBe('Không thời hạn');
    expect(validity({ effectiveFrom: '2026-05-01T00:00:00.000Z', effectiveTo: null })).toBe('01/05/2026 – nay');
  });

  it('lists policies from GET /policies, filters by type and shows the content of one', async () => {
    const calls = routeFetch({ '/policies': page([POLICY]) });
    render(<PoliciesPanel />);

    const row = (await screen.findByText('Chính sách gắn nhãn nội dung AI')).closest('tr')!;
    expect(within(row).getByText('Gắn nhãn AI')).toBeInTheDocument();
    expect(within(row).getByText('Đang áp dụng')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Lọc theo loại'), 'COPYRIGHT');
    await waitFor(() => expect(calls.some((c) => c.path === '/policies' && c.search.get('filter.type') === '$eq:COPYRIGHT')).toBe(true));
  });

  it('opens the structured content as readable lines', async () => {
    routeFetch({ '/policies': page([POLICY]) });
    render(<PoliciesPanel />);
    await userEvent.click(await screen.findByRole('button', { name: 'Xem nội dung' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Required label text')).toBeInTheDocument();
    expect(within(dialog).getByText('Nội dung do AI tạo')).toBeInTheDocument();
    expect(within(dialog).getByText('Góc màn hình')).toBeInTheDocument();
    expect(within(dialog).getByText(/Điều 44 Luật số 134\/2025/)).toBeInTheDocument();
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
