import { describe, expect, it } from 'vitest';
import { emptyEpisode } from '@/features/production/components/shared/EpisodeRowsEditor';
import {
  emptySeason,
  seasonCostValid,
  seasonValid,
  toSeasonInput,
  type SeasonDraft,
} from '@/features/production/components/shared/SeasonDraftEditor';
import { addDays } from '@/lib/format';
import { getTodayDateString } from '@/lib/dateUtils';

const today = getTodayDateString();

const season = (patch: Partial<SeasonDraft> = {}): SeasonDraft => ({
  ...emptySeason(1),
  cost: 5000,
  episodes: [{ ...emptyEpisode(1), deadline: addDays(today, 10) }],
  ...patch,
});

describe('season draft (BR-37, BR-60)', () => {
  it('prices a season with a whole number of Token above zero', () => {
    expect(seasonCostValid(5000)).toBe(true);
    expect(seasonCostValid(0)).toBe(false);
    expect(seasonCostValid(12.5)).toBe(false);
    expect(seasonCostValid(1_000_000_000)).toBe(false);
  });

  it('needs a price, a sound release window and episodes with a deadline', () => {
    expect(seasonValid(season())).toBe(true);
    expect(seasonValid(season({ cost: 0 }))).toBe(false);
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

  it('sends the price, the window and every episode to the API', () => {
    const input = toSeasonInput(
      season({ title: ' Mùa 1 ', windowStart: addDays(today, 20), episodes: [{ ...emptyEpisode(1), minutes: 15, deadline: addDays(today, 10) }] }),
    );
    expect(input).toMatchObject({
      title: 'Mùa 1',
      episodeProductionCost: 5000,
      releaseStartDate: addDays(today, 20),
      episodes: [{ targetDurationSeconds: 900, deliveryDeadline: addDays(today, 10) }],
    });
    expect(input).not.toHaveProperty('releaseEndDate');
  });
});
