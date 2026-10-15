import { describe, expect, it } from 'vitest';
import { canMove, currentHandoff, nextMilestones, submissionsOf } from '@/features/production/lib/milestones';
import type { Season, StudioHandoff } from '@/types/production';

const handoff = (id: string, seasonId: string | null, milestoneStatus: StudioHandoff['milestoneStatus']) =>
  ({ id, seasonId, milestoneStatus }) as StudioHandoff;

describe('studio milestones (BR-58)', () => {
  it('offers only the moves the API accepts', () => {
    expect(nextMilestones('BRIEF_SENT')).toEqual(['STUDIO_ACCEPTED', 'STUDIO_DECLINED']);
    expect(nextMilestones('IN_PROGRESS')).toEqual(['DELIVERED', 'STUDIO_DECLINED']);
    // The Reviewer sent the episode back: the studio works on it again.
    expect(nextMilestones('DELIVERED')).toEqual(['IN_PROGRESS']);
    expect(nextMilestones('STUDIO_DECLINED')).toEqual([]);
    expect(nextMilestones('SUPERSEDED')).toEqual([]);
  });

  it('knows when a hand-off has nowhere to go', () => {
    expect(canMove({ milestoneStatus: 'STUDIO_ACCEPTED' })).toBe(true);
    expect(canMove({ milestoneStatus: 'SUPERSEDED' })).toBe(false);
  });

  it('finds the live hand-off of a season, else the one of the whole project', () => {
    const list = [handoff('old', 's1', 'SUPERSEDED'), handoff('whole', null, 'IN_PROGRESS'), handoff('season', 's1', 'BRIEF_SENT')];
    expect(currentHandoff(list, 's1')?.id).toBe('season');
    expect(currentHandoff(list, 's2')?.id).toBe('whole');
    expect(currentHandoff([handoff('old', 's1', 'SUPERSEDED')], 's1')).toBeUndefined();
  });

  it('lists the latest version of each delivered episode a hand-off covers', () => {
    const media = { id: 'm1', version: 2, ingestStatus: 'READY', durationSeconds: 60 };
    const episode = (id: string, delivered: boolean) => ({ id, episodeNumber: 1, mediaAssets: delivered ? [media] : [] });
    const seasons = [
      { id: 's1', episodes: [episode('a', true), episode('b', false)] },
      { id: 's2', episodes: [episode('c', true)] },
    ] as unknown as Season[];
    expect(submissionsOf({ seasonId: 's1' }, seasons).map((s) => s.episode.id)).toEqual(['a']);
    expect(submissionsOf({ seasonId: null }, seasons).map((s) => s.episode.id)).toEqual(['a', 'c']);
  });
});
