import { describe, expect, it } from 'vitest';
import { episodeCountsBySeason, episodeLabel, seasonLabel, seasonName } from '@/lib/seasonLabel';

describe('season labels', () => {
  it('names a one-episode season as a whole film', () => {
    expect(seasonName(1, 1)).toBe('Phần 1 (trọn bộ)');
    expect(seasonName(2, 1)).toBe('Phần 2 (trọn bộ)');
    expect(seasonName(1, 8)).toBe('Mùa 1');
    expect(seasonName(3, undefined)).toBe('Mùa 3');
  });

  it('adds the title only when it says more than the name', () => {
    expect(seasonLabel(1, 4, 'Mùa 1')).toBe('Mùa 1');
    expect(seasonLabel(1, 1, 'Mùa 1')).toBe('Phần 1 (trọn bộ)');
    expect(seasonLabel(2, 1, 'Phần 2')).toBe('Phần 2 (trọn bộ)');
    expect(seasonLabel(1, 4, 'Khởi đầu')).toBe('Mùa 1 - Khởi đầu');
    expect(seasonLabel(1, 4, null)).toBe('Mùa 1');
  });

  it('counts episodes per season for rows that only carry the season', () => {
    const counts = episodeCountsBySeason([
      { id: 's1', episodes: [{}] },
      { id: 's2', episodes: [{}, {}, {}] },
    ]);
    expect(counts.get('s1')).toBe(1);
    expect(counts.get('s2')).toBe(3);
  });

  it('labels an episode as the part when it is alone in its season', () => {
    const episodes = [
      { seasonNumber: 1, episodeNumber: 1 },
      { seasonNumber: 2, episodeNumber: 2 },
      { seasonNumber: 2, episodeNumber: 3 },
    ];
    expect(episodeLabel(episodes[0], episodes)).toBe('Phần 1 (trọn bộ)');
    expect(episodeLabel(episodes[1], episodes)).toBe('Tập 2');
  });
});
