import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaVersions } from '@/features/production/components/episode/MediaVersions';
import type { MediaAsset } from '@/types/production';

const failed = {
  id: 'a1',
  version: 2,
  ingestStatus: 'FAILED',
  sourceMethod: 'UPLOAD',
  durationSeconds: null,
  fileSizeBytes: null,
  qualities: [],
  proposedLabelType: 'AI_GENERATED',
  ingestJobs: [],
  failureReason: 'Transcode failed',
  submissionNote: null,
  submittedBy: { fullName: 'Studio Ánh Trăng (tài khoản)' },
  studioHandoff: { studio: { name: 'Ánh Trăng' } },
  createdAt: '2026-11-08T03:00:00.000Z',
} as unknown as MediaAsset;

describe('MediaVersions', () => {
  it('shows who delivered a version and offers no reprocessing: only the studio retries, on Studio Web', () => {
    render(<MediaVersions versions={[failed]} selectedId={null} approvedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/Nộp bởi Studio Ánh Trăng \(tài khoản\)/)).toBeTruthy();
    expect(screen.getByText(/Studio Ánh Trăng · /)).toBeTruthy();
    expect(screen.getByText('Transcode failed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xử lý lại' })).toBeNull();
  });

  it('says the studio has not delivered yet', () => {
    render(<MediaVersions versions={[]} selectedId={null} approvedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Studio chưa giao bản nào.')).toBeTruthy();
  });
});
