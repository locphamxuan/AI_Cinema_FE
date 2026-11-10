import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { PublishPanel } from '@/features/production/components/episode/PublishPanel';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import type { Episode, MovieStatus, Publication } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const CONFIRMED = '2026-11-03T00:00:00.000Z';
const episode = (overrides: Partial<Episode> = {}) =>
  ({ id: 'e1', episodeNumber: 1, title: 'Tập đầu', status: 'COMPLIANCE_PASSED', coinPrice: 5, finalConfirmedAt: CONFIRMED, ...overrides }) as Episode;

const admin = { id: 'a', fullName: 'Admin Một', email: 'a@x.vn' };
const publication = (overrides: Partial<Publication> = {}): Publication => ({
  id: 'pub1',
  episodeId: 'e1',
  mediaAssetId: 'a1',
  scheduledAt: null,
  publishedAt: '2026-11-05T02:00:00.000Z',
  unpublishedAt: null,
  unpublishReason: null,
  unpublishNote: null,
  unpublishMode: null,
  createdAt: '2026-11-05T02:00:00.000Z',
  publishedBy: admin,
  unpublishedBy: null,
  ...overrides,
});

function show(ep: Episode, who: { canPrice?: boolean; canPublish?: boolean }, projectStatus: MovieStatus = 'IN_PRODUCTION') {
  const onChanged = vi.fn(async () => undefined);
  render(<PublishPanel episode={ep} projectStatus={projectStatus} canPrice={!!who.canPrice} canPublish={!!who.canPublish} onChanged={onChanged} />);
  return onChanged;
}

const bodyOf = (calls: ReturnType<typeof routeFetch>, path: string, method = 'POST') =>
  JSON.parse(calls.find((c) => c.path === path && c.method === method)!.body as string);

beforeEach(() => vi.mocked(toast.error).mockClear());
afterEach(() => vi.unstubAllGlobals());

describe('PublishPanel - the Coin price (Reviewer)', () => {
  const settings = { episodeCoinPriceMin: 1, episodeCoinPriceMax: 50 };

  it('saves a new price and warns when it is outside the platform range', async () => {
    const calls = routeFetch({ '/episodes/e1/publications': [], '/platform-settings': settings, '/episodes/e1/coin-price': {} });
    const onChanged = show(episode(), { canPrice: true });

    const input = await screen.findByLabelText(/Giá Coin \(khoảng hợp lệ 1–50\)/);
    const save = screen.getByRole('button', { name: 'Lưu giá' });
    expect(save).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, '80');
    expect(screen.getByText(/Giá ngoài khoảng/)).toBeInTheDocument();
    await userEvent.click(save);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(bodyOf(calls, '/episodes/e1/coin-price', 'PATCH')).toEqual({ coinPrice: 80 });
    expect(toast.success).toHaveBeenCalledWith('Đã lưu giá - giá ngoài khoảng nên Admin được báo');
  });

  it('shows the price read-only once the project is no longer editable', async () => {
    routeFetch({ '/episodes/e1/publications': [], '/platform-settings': settings });
    show(episode(), { canPrice: true }, 'CANCELLED');
    expect(await screen.findByText('Giá Coin: 5')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu giá' })).not.toBeInTheDocument();
  });
});

describe('PublishPanel - release (Admin)', () => {
  it('needs a Coin price before release', async () => {
    routeFetch({ '/episodes/e1/publications': [] });
    show(episode({ coinPrice: null }), { canPublish: true });
    expect(await screen.findByText(/Reviewer cần đặt giá Coin trước khi phát hành/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Phát hành ngay' })).toBeDisabled();
  });

  it('schedules the release at a future time', async () => {
    const calls = routeFetch({ '/episodes/e1/publications': [] });
    show(episode(), { canPublish: true });

    const schedule = await screen.findByRole('button', { name: 'Lên lịch' });
    expect(schedule).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Lên lịch lúc'), '2099-01-02T20:30');
    await userEvent.click(schedule);

    await waitFor(() => expect(bodyOf(calls, '/episodes/e1/publications')).toEqual({ scheduledAt: new Date('2099-01-02T20:30').toISOString() }));
  });

  it('offers no release while the project is not delivering', async () => {
    routeFetch({ '/episodes/e1/publications': [] });
    show(episode(), { canPublish: true }, 'ASSIGNED');
    expect(await screen.findByText('Chưa phát hành lần nào.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Phát hành ngay' })).not.toBeInTheDocument();
  });

  it('shows the refusal of the API when the release fails', async () => {
    routeFetch({ '/episodes/e1/publications': failWith(409, 'The Reviewer has not confirmed the Final Film') });
    const onChanged = show(episode(), { canPublish: true });

    await userEvent.click(await screen.findByRole('button', { name: 'Phát hành ngay' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('Final Film')));
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('lists past releases with how they were taken down', async () => {
    routeFetch({
      '/episodes/e1/publications': [
        publication({ unpublishedAt: '2026-11-06T00:00:00.000Z', unpublishMode: 'REVISION', unpublishReason: 'COMPLIANCE_ISSUE', unpublishNote: 'Thiếu nhãn' }),
      ],
    });
    show(episode({ status: 'UNPUBLISHED' }), { canPublish: true });
    expect(await screen.findByText(/Gỡ để sửa .* · Vấn đề tuân thủ - Thiếu nhãn/)).toBeInTheDocument();
  });
});

describe('UnpublishModal (from the PublishPanel)', () => {
  it('takes a live episode down for good with the reason and the note', async () => {
    const calls = routeFetch({ '/episodes/e1/publications': [publication()], '/publications/pub1/unpublish': {} });
    show(episode({ status: 'PUBLISHED' }), { canPublish: true });

    await userEvent.click(await screen.findByRole('button', { name: 'Gỡ tập' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('radio', { name: /^Gỡ hẳn/ }));
    await userEvent.selectOptions(within(dialog).getByLabelText('Lý do'), 'BROKEN_SOURCE');
    const submit = within(dialog).getByRole('button', { name: 'Gỡ tập' });
    await userEvent.type(within(dialog).getByLabelText('Ghi chú'), 'hỏng');
    expect(submit).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Ghi chú'), ' nguồn video');
    await userEvent.click(submit);

    await waitFor(() =>
      expect(bodyOf(calls, '/publications/pub1/unpublish')).toEqual({ mode: 'REMOVAL', reason: 'BROKEN_SOURCE', note: 'hỏng nguồn video' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('cancels a scheduled release without a mode', async () => {
    const calls = routeFetch({
      '/episodes/e1/publications': [publication({ publishedAt: null, scheduledAt: '2099-01-01T00:00:00.000Z' })],
      '/publications/pub1/unpublish': {},
    });
    show(episode({ status: 'SCHEDULED' }), { canPublish: true });

    expect(await screen.findByRole('button', { name: 'Đổi lịch' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ lịch' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('radiogroup')).not.toBeInTheDocument();
    await userEvent.type(within(dialog).getByLabelText('Ghi chú'), 'Dời sang tuần sau');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Huỷ lịch' }));

    await waitFor(() => expect(bodyOf(calls, '/publications/pub1/unpublish')).toEqual({ reason: 'MANUAL', note: 'Dời sang tuần sau' }));
  });

  it('is not offered to the Reviewer', async () => {
    routeFetch({ '/episodes/e1/publications': [publication()], '/platform-settings': {} });
    show(episode({ status: 'PUBLISHED' }), { canPrice: true });
    expect(await screen.findByText(/Phát hành .* · Admin Một/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gỡ tập' })).not.toBeInTheDocument();
  });
});
