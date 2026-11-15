import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EpisodeNotesPanel } from '@/features/production/components/episode/EpisodeNotesPanel';
import { productionService } from '@/services/productionService';

vi.mock('@/services/productionService', () => ({
  productionService: { listEpisodeNotes: vi.fn(), sendEpisodeNote: vi.fn() },
}));
vi.mock('@/components/ui/Toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.mocked(productionService);
const note = {
  id: 'n1',
  message: 'Phút 1:20 lệch kịch bản',
  createdAt: '2026-11-01T03:00:00.000Z',
  author: { id: 'helper', fullName: 'Creator Phụ' },
};

describe('EpisodeNotesPanel (BR-67)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listEpisodeNotes.mockResolvedValue({ success: true, data: [note] });
  });

  it('lets the co-Creator holding the episode write to the lead', async () => {
    api.sendEpisodeNote.mockResolvedValue({ success: true, data: [note] });
    render(<EpisodeNotesPanel episodeId="e1" canWrite isLead={false} leadName="Creator Chính" />);

    expect(await screen.findByText('Phút 1:20 lệch kịch bản')).toBeTruthy();
    expect(screen.getByText(/để Creator Chính báo Studio/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Ghi chú gửi Creator chính'), { target: { value: '  Cần dựng lại cảnh 3  ' } });
    fireEvent.click(screen.getByText('Gửi ghi chú'));

    await waitFor(() => expect(api.sendEpisodeNote).toHaveBeenCalledWith('e1', 'Cần dựng lại cảnh 3'));
    await waitFor(() => expect(api.listEpisodeNotes).toHaveBeenCalledTimes(2));
  });

  it('lets the lead answer', async () => {
    render(<EpisodeNotesPanel episodeId="e1" canWrite isLead leadName="Creator Chính" />);
    expect(await screen.findByLabelText('Trả lời Creator phụ trách tập')).toBeTruthy();
  });

  it('only shows the notes to the rest of the project', async () => {
    render(<EpisodeNotesPanel episodeId="e1" canWrite={false} isLead={false} leadName="" />);
    expect(await screen.findByText('Phút 1:20 lệch kịch bản')).toBeTruthy();
    expect(screen.queryByText('Gửi ghi chú')).toBeNull();
  });
});
