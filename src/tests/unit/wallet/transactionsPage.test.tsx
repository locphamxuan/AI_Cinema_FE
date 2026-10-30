import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TransactionsPage from '@/app/profile/transactions/page';
import { useAppStore } from '@/store/useAppStore';
import { callsOf, mockApi } from '@/tests/support/mockApi';

const line = {
  id: 'tx-1',
  entryType: 'EPISODE_PURCHASE',
  mainAmount: -8,
  bonusAmount: -2,
  rateVnd: null,
  description: 'Mua tập 3',
  referenceType: 'EPISODE_ACCESS',
  referenceId: 'acc-1',
  createdAt: '2026-10-11T03:00:00.000Z',
  mainBalanceAfter: 92,
  bonusBalanceAfter: 18,
};
const page = { data: [line], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 20 } };

describe('TransactionsPage (GET /wallet/statements)', () => {
  beforeEach(() => useAppStore.setState({ isAuthenticated: true, wallet: { mainCoin: 92, bonusCoin: 18 } }));
  afterEach(() => vi.unstubAllGlobals());

  it('lists the ledger lines with both counters and the balance after them', async () => {
    mockApi({ 'GET /wallet/statements': page });

    render(<TransactionsPage />);

    expect((await screen.findAllByText('Mua tập 3')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('-8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-2').length).toBeGreaterThan(0);
    expect(screen.getByText('92 🟡 · 18 🎁')).toBeInTheDocument();
  });

  it('asks the BE again with the counter the member picked', async () => {
    const fetchMock = mockApi({ 'GET /wallet/statements': page });

    render(<TransactionsPage />);
    await screen.findAllByText('Mua tập 3');
    fireEvent.click(screen.getByRole('button', { name: 'Coin thưởng' }));

    await waitFor(() => expect(callsOf(fetchMock).some((c) => c.includes('kind=BONUS'))).toBe(true));
  });
});
