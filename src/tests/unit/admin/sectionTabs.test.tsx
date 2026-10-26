import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { PERMISSION } from '@/lib/permissions';
import { signInAs } from '@/tests/support/signIn';

const search = { tab: 'tokens' };
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/requests',
  useSearchParams: () => new URLSearchParams(search),
}));

const tabs = [
  { key: 'changes', label: 'Đề xuất thay đổi', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <p>Hộp đề xuất</p> },
  { key: 'tokens', label: 'Xin thêm Token', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <p>Danh sách xin Token</p> },
  { key: 'budgets', label: 'Ngân sách Token Reviewer', permission: PERMISSION.TOKEN_BUDGET_MANAGE, content: <p>Ngân sách</p> },
];

describe('SectionTabs', () => {
  it('opens the tab named in ?tab= and links every tab the account may open', () => {
    signInAs('admin');
    render(<SectionTabs title="Duyệt yêu cầu" description="Mô tả" tabs={tabs} />);

    expect(screen.getByText('Danh sách xin Token')).toBeInTheDocument();
    expect(screen.queryByText('Hộp đề xuất')).toBeNull();
    expect(screen.getByRole('link', { name: 'Xin thêm Token' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Ngân sách Token Reviewer' })).toHaveAttribute('href', '/admin/requests?tab=budgets');
  });

  it('hides the tabs a permission does not open and falls back to the first open one', () => {
    signInAs('admin', [PERMISSION.TOKEN_BUDGET_MANAGE]);
    render(<SectionTabs title="Duyệt yêu cầu" description="Mô tả" tabs={tabs} />);

    expect(screen.getByText('Ngân sách')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Xin thêm Token' })).toBeNull();
  });
});
