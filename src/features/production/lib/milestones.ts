import type { Episode, Season, StudioHandoff, StudioMilestoneStatus } from '@/types/production';

/** A milestone the Creator can move a hand-off to; the rest are set by the system (BR-58). */
export type CreatorMilestone = Exclude<StudioMilestoneStatus, 'BRIEF_SENT' | 'SUPERSEDED'>;

/** Same moves as the backend's milestone-rules.ts, so the form only offers what the API accepts. */
const NEXT: Record<StudioMilestoneStatus, CreatorMilestone[]> = {
  BRIEF_SENT: ['STUDIO_ACCEPTED', 'STUDIO_DECLINED'],
  STUDIO_ACCEPTED: ['IN_PROGRESS', 'STUDIO_DECLINED'],
  IN_PROGRESS: ['DELIVERED', 'STUDIO_DECLINED'],
  // The Reviewer sent the episode back: the studio works on it again.
  DELIVERED: ['IN_PROGRESS'],
  STUDIO_DECLINED: [],
  SUPERSEDED: [],
};

export function nextMilestones(status: StudioMilestoneStatus): CreatorMilestone[] {
  return NEXT[status];
}

/** Whether the milestone still has somewhere to go. */
export function canMove(handoff: Pick<StudioHandoff, 'milestoneStatus'>): boolean {
  return NEXT[handoff.milestoneStatus].length > 0;
}

/** The hand-off that is current for a season: its own, else the one that covers the whole project. */
export function currentHandoff(handoffs: StudioHandoff[], seasonId: string | null): StudioHandoff | undefined {
  const live = handoffs.filter((h) => h.milestoneStatus !== 'SUPERSEDED');
  return live.find((h) => h.seasonId === seasonId) ?? live.find((h) => h.seasonId === null);
}

/** Episodes a hand-off covers: one season, or every season when it is for the whole project. */
function episodesOfHandoff(handoff: Pick<StudioHandoff, 'seasonId'>, seasons: Season[]): Episode[] {
  return seasons.filter((s) => !handoff.seasonId || s.id === handoff.seasonId).flatMap((s) => s.episodes);
}

/** The latest version of each episode a hand-off covers: what a DELIVERED milestone can point at. */
export function submissionsOf(handoff: Pick<StudioHandoff, 'seasonId'>, seasons: Season[]) {
  return episodesOfHandoff(handoff, seasons)
    .filter((episode) => episode.mediaAssets.length > 0)
    .map((episode) => ({ episode, media: episode.mediaAssets[0] }));
}
