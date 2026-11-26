import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EpisodePricingModal } from '@/features/admin/components/EpisodePricingModal';
import { mockApi } from '@/tests/support/mockApi';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(() => vi.unstubAllGlobals());

const bodyOf = (fetchMock: ReturnType<typeof mockApi>, path: string) => {
  const call = fetchMock.mock.calls.find(([url, init]) => init?.method === 'PATCH' && String(url).endsWith(path));
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};

describe('EpisodePricingModal', () => {
  it('warns about a price outside the platform range and makes a Guest-free episode Member-free too', async () => {
    const fetchMock = mockApi({
      'GET /platform-settings': { episodeCoinPriceMin: 1, episodeCoinPriceMax: 50 },
      'PATCH /episodes/e1/coin-price': {},
      'PATCH /episodes/e1/access-flags': {},
    });
    render(<EpisodePricingModal episode={{ id: 'e1', label: 'Tập 1', coinPrice: null }} onClose={vi.fn()} onChanged={vi.fn(async () => {})} />);

    await userEvent.type(screen.getByLabelText('Giá Coin'), '80');
    expect(await screen.findByText(/Ngoài khoảng 1–50 Coin/)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Miễn phí cho khách chưa đăng nhập'));
    expect(screen.getByRole('checkbox', { name: /Miễn phí cho Member/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Miễn phí cho Member/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(bodyOf(fetchMock, '/access-flags')).toEqual({ isFreeForGuest: true, isFreeForMember: true }));
    expect(bodyOf(fetchMock, '/coin-price')).toEqual({ coinPrice: 80 });
  });

  it('refuses a price above the API ceiling', async () => {
    mockApi({ 'GET /platform-settings': { episodeCoinPriceMin: 1, episodeCoinPriceMax: 50 } });
    render(<EpisodePricingModal episode={{ id: 'e1', label: 'Tập 1', coinPrice: null }} onClose={vi.fn()} onChanged={vi.fn(async () => {})} />);
    await userEvent.type(screen.getByLabelText('Giá Coin'), '1000001');
    expect(screen.getByRole('alert')).toHaveTextContent('từ 0 đến 1.000.000');
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  });
});
