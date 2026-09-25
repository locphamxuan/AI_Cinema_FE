import type { EpisodePackage, QuotaRequest } from '@/types/workflow';

/** Share of the quota used at which the Creator is warned to ask for a top-up. */
export const QUOTA_WARNING_PERCENT = 90;

export interface QuotaUsage {
  used: number;
  allocated: number;
  remaining: number;
  /** 0–100, capped. */
  percent: number;
  isWarning: boolean;
}

/** How much of an episode's own quota its generation jobs have used. */
export function quotaUsage(episode: Pick<EpisodePackage, 'actual_tokens_used' | 'quota_allocated'> | undefined): QuotaUsage {
  const used = episode?.actual_tokens_used ?? 0;
  const allocated = episode?.quota_allocated ?? 0;
  const percent = allocated > 0 ? Math.min(100, (used / allocated) * 100) : 0;
  return { used, allocated, remaining: Math.max(0, allocated - used), percent, isWarning: percent >= QUOTA_WARNING_PERCENT };
}

/** The request still waiting for the Reviewer; the backend allows one per episode. */
export function pendingQuotaRequest(episode: Pick<EpisodePackage, 'quota_requests'> | undefined): QuotaRequest | undefined {
  return episode?.quota_requests.find((r) => r.status === 'pending');
}

/** A top-up can be asked for once the episode has a quota and until its cut is handed in. */
export function canRequestQuota(episode: Pick<EpisodePackage, 'status' | 'quota_allocated' | 'quota_requests'>): boolean {
  const producing = episode.status === 'QUOTA_ALLOCATED' || episode.status === 'IN_PRODUCTION' || episode.status === 'CUT_CHANGES_REQUESTED';
  return producing && episode.quota_allocated > 0 && !pendingQuotaRequest(episode);
}
