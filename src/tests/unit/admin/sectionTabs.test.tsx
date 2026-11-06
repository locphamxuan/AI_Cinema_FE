import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { PERMISSION } from '@/lib/permissions';
import { signInAs } from '@/tests/support/signIn';

const search = { tab: 'costs' };
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/requests',
  useSearchParams: () => new URLSearchParams(search),
}));

const tabs = [
  { key: 'changes', label: 'Đề xuất thay đổi', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <p>Hộp đề xuất</p> },
  { key: 'costs', label: 'Yêu cầu thêm chi phí', permission: PERMISSION.COST_APPROVE, content: <p>Danh sách yêu cầu chi phí</p> },
  { key: 'budgets', label: 'Ngân sách', permission: PERMISSION.COST_ADJUST, content: <p>Ngân sách</p> },
];

describe('SectionTabs', () => {
  it('opens the tab named in ?tab= and links every tab the account may open', () => {
    signInAs('admin');
    render(<SectionTabs title="Duyệt yêu cầu" description="Mô tả" tabs={tabs} />);

    expect(screen.getByText('Danh sách yêu cầu chi phí')).toBeInTheDocument();
    expect(screen.queryByText('Hộp đề xuất')).toBeNull();
    expect(screen.getByRole('link', { name: 'Yêu cầu thêm chi phí' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Ngân sách' })).toHaveAttribute('href', '/admin/requests?tab=budgets');
  });

  it('hides the tabs a permission does not open and falls back to the first open one', () => {
    signInAs('admin', [PERMISSION.COST_ADJUST]);
    render(<SectionTabs title="Duyệt yêu cầu" description="Mô tả" tabs={tabs} />);

    expect(screen.getByText('Ngân sách')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Yêu cầu thêm chi phí' })).toBeNull();
  });
});
