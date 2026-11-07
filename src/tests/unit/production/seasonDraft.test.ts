import { describe, expect, it } from 'vitest';
import { emptyEpisode } from '@/features/production/components/shared/EpisodeRowsEditor';
import {
  emptySeason,
  seasonValid,
  toSeasonInput,
  type SeasonDraft,
} from '@/features/production/components/shared/SeasonDraftEditor';
import { addDays } from '@/lib/format';
import { getTodayDateString } from '@/lib/dateUtils';

const today = getTodayDateString();

const season = (patch: Partial<SeasonDraft> = {}): SeasonDraft => ({
  ...emptySeason(1),
  episodes: [{ ...emptyEpisode(1), deadline: addDays(today, 10) }],
  ...patch,
});

describe('season draft (BR-37, BR-60)', () => {
  it('needs a sound release window and episodes with a deadline', () => {
    expect(seasonValid(season())).toBe(true);
    expect(seasonValid(season({ windowStart: addDays(today, 30), windowEnd: addDays(today, 20) }))).toBe(false);
    expect(seasonValid(season({ episodes: [emptyEpisode(1)] }))).toBe(false);
  });

  it('refuses an episode released outside the window or before its deadline', () => {
    const window = { windowStart: addDays(today, 20), windowEnd: addDays(today, 40) };
    const withRelease = (releaseDate: string) =>
      season({ ...window, episodes: [{ ...emptyEpisode(1), deadline: addDays(today, 10), releaseDate }] });
    expect(seasonValid(withRelease(addDays(today, 25)))).toBe(true);
    expect(seasonValid(withRelease(addDays(today, 15)))).toBe(false);
    expect(seasonValid(withRelease(addDays(today, 50)))).toBe(false);
  });

  it('sends the window and every episode to the API, never a Token price', () => {
    const input = toSeasonInput(
      season({ title: ' Mùa 1 ', windowStart: addDays(today, 20), episodes: [{ ...emptyEpisode(1), minutes: 15, deadline: addDays(today, 10) }] }),
    );
    expect(input).toMatchObject({
      title: 'Mùa 1',
      releaseStartDate: addDays(today, 20),
      episodes: [{ targetDurationSeconds: 900, deliveryDeadline: addDays(today, 10) }],
    });
    expect(input).not.toHaveProperty('releaseEndDate');
    expect(input).not.toHaveProperty('episodeProductionCost');
  });
});
