import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabelPanel } from '@/features/production/components/episode/LabelPanel';
import { routeFetch } from '@/tests/support/routeFetch';
import type { AiContentLabel, EpisodeStatus, ReviewSheet } from '@/types/production';

const policy = { id: 'p1', name: 'Quy định gắn nhãn AI', documentReference: null };

function sheet(status: EpisodeStatus, label: AiContentLabel | null): ReviewSheet {
  return {
    id: 'a1',
    proposedLabelType: 'AI_GENERATED',
    aiContentLabel: label,
    isApprovedVersion: true,
    episode: { id: 'e1', episodeNumber: 1, title: 'Tập 1', status, targetDurationSeconds: 600, movie: { id: 'm1', title: 'Phim', status: 'IN_PRODUCTION' } },
  } as ReviewSheet;
}

const applied: AiContentLabel = {
  id: 'l1',
  labelType: 'AI_GENERATED',
  labelText: 'Nội dung được tạo bởi AI',
  displayLocation: 'TOP_LEFT',
  appliedAt: '2026-10-14T01:00:00.000Z',
  policy,
};

afterEach(() => vi.unstubAllGlobals());

describe('LabelPanel (BR-40)', () => {
  it('shows the Reviewer the proposed label and how it will look over the video before it is applied', async () => {
    const calls = routeFetch({});
    render(<LabelPanel sheet={sheet('APPROVED', null)} canAct onChanged={async () => undefined} />);

    expect(screen.getByText(/Creator đề xuất “Do AI tạo”/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Xem trước nhãn AI/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Gắn nhãn/ }));
    expect(calls.some((c) => c.method === 'POST' && c.path === '/media-assets/a1/ai-content-labels')).toBe(true);
  });

  it('lets the Reviewer change an applied label, warning that the legal check must be redone', async () => {
    routeFetch({});
    render(<LabelPanel sheet={sheet('COMPLIANCE_PASSED', applied)} canAct onChanged={async () => undefined} />);

    expect(screen.getByRole('img', { name: /Nội dung được tạo bởi AI/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Đổi nhãn/ }));
    expect(screen.getByText(/phải kiểm tra pháp lý lại/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lưu nhãn/ })).toBeEnabled();
  });

  it('is read-only for anyone who may not decide', () => {
    render(<LabelPanel sheet={sheet('LABELED', applied)} canAct={false} onChanged={async () => undefined} />);

    expect(screen.getByRole('img', { name: /Nội dung được tạo bởi AI/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đổi nhãn/ })).not.toBeInTheDocument();
  });
});
