import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeliverMediaPanel } from '@/features/production/components/episode/DeliverMediaPanel';
import type { StudioFilmLink } from '@/types/production';

const film: StudioFilmLink = {
  id: 'l1',
  episodeId: 'e1',
  version: 'v2',
  fileName: 'tap-1.mp4',
  url: 'http://studio.test/films/a/tap-1.mp4',
  sentAt: '2026-10-15T03:00:00.000Z',
  episode: { episodeNumber: 1 },
};

const renderPanel = (studioFilm?: StudioFilmLink) =>
  render(<DeliverMediaPanel deliver={vi.fn()} onDelivered={vi.fn()} studioFilm={studioFilm} />);

describe('DeliverMediaPanel with the film the studio mailed', () => {
  it('offers nothing when the studio has not mailed the episode', () => {
    renderPanel();
    expect(screen.queryByText('Dùng link này')).toBeNull();
  });

  it('links to the film and fills it in as the file link to import', () => {
    renderPanel(film);
    expect(screen.getByText(/Xem phim/).closest('a')?.getAttribute('href')).toBe(film.url);

    fireEvent.click(screen.getByText('Dùng link này'));

    expect(screen.getByRole('radio', { name: 'Link file' }).getAttribute('aria-checked')).toBe('true');
    expect((screen.getByPlaceholderText('https://…') as HTMLInputElement).value).toBe(film.url);
  });
});

describe('DeliverMediaPanel AI Disclosure', () => {
  it('sends only the AI-made parts and both studio pledges, and waits for both pledges', async () => {
    const deliver = vi.fn().mockResolvedValue({ success: true, data: {} });
    render(<DeliverMediaPanel deliver={deliver} onDelivered={vi.fn()} studioFilm={film} />);
    fireEvent.click(screen.getByText('Dùng link này'));
    const submit = screen.getByRole('button', { name: /Giao bản dựng/ });

    fireEvent.click(screen.getByLabelText(/không mô phỏng người thật/));
    expect(submit.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByLabelText(/không sử dụng tác phẩm có bản quyền/));
    fireEvent.click(submit);

    await waitFor(() => expect(deliver).toHaveBeenCalledTimes(1));
    expect(deliver.mock.calls[0][0].meta.aiDisclosure).toEqual({
      aiGeneratedParts: ['video'],
      noRealPersonLikeness: true,
      noCopyrightedMaterial: true,
    });
  });
});
