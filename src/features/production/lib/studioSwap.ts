import type { ProjectDetail, StudioHandoff } from '@/types/production';

type SwapHandoff = Pick<StudioHandoff, 'seasonId' | 'milestoneStatus' | 'productionFeeTokens' | 'lostTokens'> & {
  emailMessage: { status: 'QUEUED' | 'SENT' | 'FAILED' } | null;
};

/** What a studio change of one scope costs and what the new studio's brief may still promise (BR-59). */
export interface SwapPreview {
  /** Fee of the hand-offs being replaced, spent on the old studio. */
  lostTokens: number;
  /** What the new brief would carry; 0 = the Creator must ask the Reviewer for Token first. */
  availableTokens: number;
}

/** Mirrors the API: a studio that declined, or a brief that never left, costs nothing. */
export function lostOnReplace(handoff: SwapHandoff): number {
  if (handoff.milestoneStatus === 'STUDIO_DECLINED') return 0;
  if (handoff.emailMessage?.status === 'FAILED') return 0;
  return Number(handoff.productionFeeTokens);
}

export function swapPreview(
  project: Pick<ProjectDetail, 'productionFeeTokens' | 'seasonFees'> & { studioHandoffs: SwapHandoff[] },
  seasonId: string | null,
): SwapPreview {
  const replaced = project.studioHandoffs.filter((h) => h.seasonId === seasonId && h.milestoneStatus !== 'SUPERSEDED');
  const lostTokens = replaced.reduce((sum, h) => sum + lostOnReplace(h), 0);
  const lostSoFar = project.studioHandoffs.reduce((sum, h) => sum + Number(h.lostTokens ?? 0), 0);
  const projectLeft = project.productionFeeTokens - lostSoFar - lostTokens;
  const season = seasonId ? project.seasonFees.find((fee) => fee.seasonId === seasonId) : undefined;
  const left = season ? Math.min(season.availableTokens - lostTokens, projectLeft) : projectLeft;
  return { lostTokens, availableTokens: Math.max(0, left) };
}
