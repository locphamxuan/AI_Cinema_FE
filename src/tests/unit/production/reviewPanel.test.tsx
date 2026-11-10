import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { ReviewPanel } from '@/features/production/components/episode/ReviewPanel';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import type { ComplianceCheck, EpisodeStatus, ReviewSheet } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const policy = { id: 'p1', name: 'Nghị định 142', documentReference: null };

function sheet(status: EpisodeStatus, overrides: Partial<ReviewSheet> = {}): ReviewSheet {
  return {
    id: 'a1',
    version: 3,
    ingestStatus: 'READY',
    proposedLabelType: 'AI_GENERATED',
    aiContentLabel: null,
    complianceChecks: [],
    contentReviews: [],
    isApprovedVersion: status !== 'IN_REVIEW',
    aiDisclosure: { aiGeneratedParts: ['video', 'voice'], noRealPersonLikeness: true, noCopyrightedMaterial: false },
    durationCheck: { targetSeconds: 600, actualSeconds: 660, deviationSeconds: 60, warning: true },
    episode: { id: 'e1', episodeNumber: 1, title: 'Tập 1', status, targetDurationSeconds: 600, movie: { id: 'm1', title: 'Phim', status: 'IN_PRODUCTION' } },
    ...overrides,
  } as ReviewSheet;
}

const renderPanel = (s: ReviewSheet, canAct = true) => {
  const onChanged = vi.fn(async () => undefined);
  render(<ReviewPanel sheet={s} canAct={canAct} onChanged={onChanged} />);
  return onChanged;
};

const bodyOf = (calls: ReturnType<typeof routeFetch>, path: string) => JSON.parse(calls.find((c) => c.path === path)!.body as string);

beforeEach(() => vi.mocked(toast.error).mockClear());
afterEach(() => vi.unstubAllGlobals());

describe('ReviewPanel - the review sheet', () => {
  it('shows the duration warning, the AI parts and the pledges the studio gave', () => {
    routeFetch({});
    renderPanel(sheet('IN_REVIEW'), false);
    expect(screen.getByText(/mục tiêu/)).toHaveClass('text-amber-600');
    expect(screen.getByText('Video, Giọng nói')).toBeInTheDocument();
    expect(screen.getByText('Studio đã cam kết')).toBeInTheDocument();
    expect(screen.getByText('Studio chưa cam kết')).toBeInTheDocument();
  });

  it('lets the Reviewer in charge approve a version under review', async () => {
    const calls = routeFetch({ '/media-assets/a1/reviews': {} });
    const onChanged = renderPanel(sheet('IN_REVIEW'));

    await userEvent.click(screen.getByRole('button', { name: 'Duyệt' }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(bodyOf(calls, '/media-assets/a1/reviews')).toMatchObject({ decision: 'APPROVED' });
  });

  it('sends the studio a change request with the comments', async () => {
    const calls = routeFetch({ '/media-assets/a1/reviews': {} });
    const onChanged = renderPanel(sheet('IN_REVIEW'));

    await userEvent.click(screen.getByRole('button', { name: 'Yêu cầu sửa' }));
    const dialog = await screen.findByRole('dialog');
    const send = within(dialog).getByRole('button', { name: 'Gửi yêu cầu sửa' });
    await userEvent.type(within(dialog).getByRole('textbox'), 'méo');
    expect(send).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), ' mặt ở phút 03:10');
    await userEvent.click(send);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(bodyOf(calls, '/media-assets/a1/reviews')).toEqual({ decision: 'CHANGES_REQUESTED', comments: 'méo mặt ở phút 03:10' });
  });

  it('gives anyone else the sheet without a decision', () => {
    routeFetch({});
    renderPanel(sheet('IN_REVIEW'), false);
    expect(screen.queryByRole('button', { name: 'Duyệt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yêu cầu sửa' })).not.toBeInTheDocument();
  });

  it('offers no approval while the version is still processing', () => {
    routeFetch({});
    renderPanel(sheet('IN_REVIEW', { ingestStatus: 'TRANSCODING' }));
    expect(screen.queryByRole('button', { name: 'Duyệt' })).not.toBeInTheDocument();
  });

  it('lists the past decisions on the version', () => {
    routeFetch({});
    renderPanel(
      sheet('IN_REVIEW', {
        contentReviews: [{ id: 'r1', decision: 'CHANGES_REQUESTED', comments: 'Âm thanh rè', createdAt: '2026-11-02T00:00:00.000Z', reviewer: { id: 'r', fullName: 'Reviewer Một', email: 'r@x.vn' } }],
      }),
    );
    expect(screen.getByText('Lịch sử duyệt bản này')).toBeInTheDocument();
    expect(screen.getByText('Âm thanh rè')).toBeInTheDocument();
  });

  it('shows the refusal of the API and changes nothing', async () => {
    routeFetch({ '/media-assets/a1/reviews': failWith(409, 'The episode is not IN_REVIEW') });
    const onChanged = renderPanel(sheet('IN_REVIEW'));

    await userEvent.click(screen.getByRole('button', { name: 'Duyệt' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('IN_REVIEW')));
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe('ReviewPanel - the compliance check (BR-42)', () => {
  const pass = (name: string) => userEvent.click(within(screen.getByText(name).parentElement!).getByLabelText('Đạt'));

  it('records a passing check once every item is answered', async () => {
    const calls = routeFetch({ '/media-assets/a1/compliance-checks': {} });
    const onChanged = renderPanel(sheet('LABELED'));

    const submit = screen.getByRole('button', { name: /Hoàn tất các mục kiểm tra/ });
    expect(submit).toBeDisabled();
    await pass('Thông báo theo Nghị định 142');
    await pass('An toàn nội dung');
    await userEvent.click(screen.getByRole('radio', { name: 'Không' }));
    await userEvent.click(screen.getByRole('button', { name: /Xác nhận đã kiểm tra và đạt/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(bodyOf(calls, '/media-assets/a1/compliance-checks')).toEqual({
      decree142Notice: { result: 'PASS' },
      contentSafety: { result: 'PASS' },
      depictsRealPersonOrEvent: false,
    });
  });

  it('needs a reason of five letters for a failed item, then records the failure', async () => {
    const calls = routeFetch({ '/media-assets/a1/compliance-checks': {} });
    renderPanel(sheet('LABELED'));

    await pass('Thông báo theo Nghị định 142');
    await userEvent.click(within(screen.getByText('An toàn nội dung').parentElement!).getByLabelText('Không đạt'));
    await userEvent.click(screen.getByRole('radio', { name: 'Có' }));
    await userEvent.type(screen.getByLabelText('Lý do không đạt: An toàn nội dung'), 'bạo');
    expect(screen.getByRole('button', { name: /Hoàn tất các mục kiểm tra/ })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Lý do không đạt: An toàn nội dung'), ' lực');
    await userEvent.type(screen.getByLabelText('Ghi chú người/sự kiện thật'), 'Giống ca sĩ có thật');
    await userEvent.click(screen.getByRole('button', { name: /Ghi nhận không đạt/ }));

    await waitFor(() =>
      expect(bodyOf(calls, '/media-assets/a1/compliance-checks')).toEqual({
        decree142Notice: { result: 'PASS' },
        contentSafety: { result: 'FAIL', failureReason: 'bạo lực' },
        depictsRealPersonOrEvent: true,
        realPersonNote: 'Giống ca sĩ có thật',
      }),
    );
  });

  it('warns that the real-person item cannot pass without the pledge of the studio', () => {
    routeFetch({});
    renderPanel(sheet('LABELED', { aiDisclosure: { aiGeneratedParts: [], noRealPersonLikeness: false, noCopyrightedMaterial: true } }));
    expect(screen.getByText(/Studio chưa cam kết không dùng hình ảnh giống người thật/)).toBeInTheDocument();
  });

  it('shows saved results read-only to someone who cannot act', () => {
    routeFetch({});
    const checks: ComplianceCheck[] = [
      { id: 'k1', checkType: 'CONTENT_SAFETY', result: 'FAIL', failureReason: 'Cảnh máu me', checkedAt: '2026-11-03T00:00:00.000Z', policy },
    ];
    renderPanel(sheet('COMPLIANCE_PASSED', { complianceChecks: checks }), false);
    expect(screen.getByText('Cảnh máu me')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hoàn tất|Xác nhận đã kiểm tra/ })).not.toBeInTheDocument();
  });
});
