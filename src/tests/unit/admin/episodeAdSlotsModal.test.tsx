import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EpisodeAdSlotsModal } from '@/features/admin/components/EpisodeAdSlotsModal';
import { adAdminService } from '@/services/adAdminService';
import type { AdminAd, EpisodeAdSlots } from '@/types/playback';

const ad: AdminAd = {
  id: 'a1',
  title: 'TestQC',
  mediaUrl: 'https://cdn.example/ad.mp4',
  clickUrl: null,
  durationSeconds: 15,
  weight: 1,
  status: 'ACTIVE',
  validFrom: null,
  validTo: null,
};

const placed: EpisodeAdSlots = {
  episodeId: 'e1',
  durationSeconds: 215,
  mode: 'MANUAL',
  slots: [{ id: 's1', positionSeconds: 60, ad: { id: 'a1', title: 'TestQC' } }],
};

describe('EpisodeAdSlotsModal', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows each cue as a card with its time and ad, and saves the edited cues in order', async () => {
    vi.spyOn(adAdminService, 'ads').mockResolvedValue({ success: true, data: [ad] });
    vi.spyOn(adAdminService, 'slots').mockResolvedValue({ success: true, data: placed });
    const save = vi.spyOn(adAdminService, 'saveSlots').mockResolvedValue({ success: true, data: placed });
    const onClose = vi.fn();
    render(<EpisodeAdSlotsModal episode={{ id: 'e1', label: 'Tập 1' }} onClose={onClose} />);

    expect(await screen.findByText('Lần 1')).toBeTruthy();
    expect(screen.getByText('1:00')).toBeTruthy();
    expect(screen.getAllByLabelText('Quảng cáo lần 1').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Thêm lần chèn'));
    fireEvent.change(screen.getByLabelText('Giây chèn lần 2'), { target: { value: '30' } });
    expect(screen.getByText('0:30')).toBeTruthy();
    fireEvent.click(screen.getByText('Lưu vị trí'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith('e1', [
      { positionSeconds: 30, adId: null },
      { positionSeconds: 60, adId: 'a1' },
    ]);
  });
});
