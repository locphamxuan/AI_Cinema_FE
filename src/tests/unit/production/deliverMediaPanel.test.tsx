import { fireEvent, render, screen } from '@testing-library/react';
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
