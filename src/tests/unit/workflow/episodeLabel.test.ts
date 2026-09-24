import { describe, it, expect } from 'vitest';
import { episodeLabel, episodeName, spansSeasons } from '@/features/workflow/lib/episodeLabel';

describe('episodeLabel', () => {
  it('names the season only when the project has several', () => {
    const episodes = [
      { season_number: 1, episode_number: 1 },
      { season_number: 2, episode_number: 3 },
    ];
    expect(spansSeasons(episodes)).toBe(true);
    expect(episodeLabel(episodes[1], true)).toBe('Mùa 2 · Tập 3');
    expect(episodeLabel(episodes[1], spansSeasons([episodes[1]]))).toBe('Tập 3');
  });

  it('strips either label form from a title', () => {
    expect(episodeName('Mùa 2 · Tập 3: Saigon 2077')).toBe('Saigon 2077');
    expect(episodeName('Tập 1: Saigon 2077')).toBe('Saigon 2077');
    expect(episodeName('Saigon 2077')).toBe('Saigon 2077');
  });
});
