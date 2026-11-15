import type { ProjectDetail, StudioHandoff } from '@/types/production';

type SwapHandoff = Pick<StudioHandoff, 'seasonId' | 'milestoneStatus' | 'offeredFeeVnd'>;

/** What a studio change of one scope frees and what the new studio's brief may offer at most (BR-59). */
export interface SwapPreview {
  /** Fee of the hand-offs being replaced: it returns to the budget, minus what the old studio keeps. */
  replacedFeeVnd: number;
  /** Highest fee the new brief may offer once the old studio kept `forfeitedVnd`. */
  maxOfferVnd: number;
}

/** Mirrors the API: a replaced hand-off keeps only what was forfeited; the rest of its fee is free again. */
export function swapPreview(
  project: Pick<ProjectDetail, 'cost'> & { studioHandoffs: SwapHandoff[] },
  seasonId: string | null,
  forfeitedVnd = 0,
): SwapPreview {
  const replaced = project.studioHandoffs.filter((h) => h.seasonId === seasonId && h.milestoneStatus !== 'SUPERSEDED');
  const replacedFeeVnd = replaced.reduce((sum, h) => sum + Number(h.offeredFeeVnd), 0);
  const kept = Math.min(Math.max(0, forfeitedVnd), replacedFeeVnd);
  return { replacedFeeVnd, maxOfferVnd: Math.max(0, project.cost.remainingVnd + replacedFeeVnd - kept) };
}
