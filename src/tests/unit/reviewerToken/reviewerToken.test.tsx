import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewerTokensPanel } from '@/features/admin/components/ReviewerTokensPanel';
import { ReviewerSidebar } from '@/features/production/components/shell/ReviewerSidebar';
import { notificationHref } from '@/features/production/lib/routes';
import { signInAs } from '@/tests/support/signIn';
import { useAppStore } from '@/store/useAppStore';
import type { ReviewerBudgetRow, ReviewerWallet } from '@/types/reviewer-token';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reviewer/projects',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const wallet: ReviewerWallet = {
  reviewer: { id: 'r1', fullName: 'Reviewer Một', email: 'r1@x.vn' },
  grantedTokens: 500000,
  allocatedTokens: 120000,
  balanceTokens: 380000,
  tokenRateVnd: 1000,
  history: [],
};

const row: ReviewerBudgetRow = { id: 'r1', fullName: 'Reviewer Một', email: 'r1@x.vn', isActive: true, grantedTokens: 500000, allocatedTokens: 120000, balanceTokens: 380000 };

/** Answers each API path with its body and records every request. */
function routeFetch(routes: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, 'http://x').pathname.replace(/^\/api/, '');
    return { ok: true, status: init?.method === 'POST' ? 201 : 200, json: async () => routes[path] ?? [] };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('ReviewerSidebar', () => {
  it('keeps the Reviewer’s Token balance in sight', async () => {
    signInAs('reviewer');
    routeFetch({ '/reviewer-tokens/me': wallet });
    render(<ReviewerSidebar />);

    expect(screen.getByRole('link', { name: /Dự án phim/ })).toHaveAttribute('aria-current', 'page');
    const tokens = screen.getByRole('link', { name: /Token/ });
    expect(tokens).toHaveAttribute('href', '/reviewer/tokens');
    expect(await within(tokens).findByText('380.000')).toBeInTheDocument();
  });

  it('gives the Admin overseeing projects no Token item', () => {
    signInAs('admin');
    routeFetch({});
    render(<ReviewerSidebar />);
    expect(screen.queryByRole('link', { name: /Token/ })).not.toBeInTheDocument();
  });
});

describe('ReviewerTokensPanel', () => {
  it('takes Token back only within the balance and with a reason', async () => {
    signInAs('admin');
    const fetchMock = routeFetch({ '/admin/reviewer-tokens': [row], '/admin/reviewer-tokens/r1/entries': wallet });
    render(<ReviewerTokensPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thu hồi Token của Reviewer Một' }));
    const dialog = await screen.findByRole('dialog');
    const submit = within(dialog).getByRole('button', { name: 'Thu hồi' });
    await userEvent.type(within(dialog).getByRole('spinbutton'), '400000');
    await userEvent.type(within(dialog).getByRole('textbox'), 'Thu về cuối quý.');
    expect(submit).toBeDisabled();

    await userEvent.clear(within(dialog).getByRole('spinbutton'));
    await userEvent.type(within(dialog).getByRole('spinbutton'), '80000');
    await userEvent.click(submit);
    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    expect(JSON.parse((post![1] as RequestInit).body as string)).toEqual({
      entryType: 'REVOKE',
      amountTokens: 80000,
      reason: 'Thu về cuối quý.',
    });
  });
});

describe('notification links', () => {
  it('sends a Token notification to the Reviewer’s Token page', () => {
    expect(notificationHref('/tokens', 'reviewer')).toBe('/reviewer/tokens');
  });
});
