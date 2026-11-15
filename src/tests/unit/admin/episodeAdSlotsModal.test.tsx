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
    const adElements = await screen.findAllByText(/TestQC/);
    expect(adElements[0]).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: 'Lưu vị trí' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith('e1', [{ positionSeconds: 60, adId: 'a1' }]);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
