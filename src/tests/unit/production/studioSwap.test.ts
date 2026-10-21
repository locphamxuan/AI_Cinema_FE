import { describe, expect, it } from 'vitest';
import { lostOnReplace, swapPreview } from '@/features/production/lib/studioSwap';
import type { SeasonFee } from '@/types/production';

type Status = 'BRIEF_SENT' | 'STUDIO_ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'STUDIO_DECLINED' | 'SUPERSEDED';

const handoff = (
  seasonId: string | null,
  milestoneStatus: Status,
  fee: number,
  lost = 0,
  email: 'QUEUED' | 'SENT' | 'FAILED' = 'SENT',
) => ({ seasonId, milestoneStatus, productionFeeTokens: fee, lostTokens: lost, emailMessage: { status: email } });

const fee = (seasonId: string, availableTokens: number) => ({ seasonId, availableTokens }) as SeasonFee;

describe('studio swap preview (BR-59)', () => {
  it('spends the fee of a studio that got the brief, not of one that declined or never got it', () => {
    expect(lostOnReplace(handoff(null, 'IN_PROGRESS', 500))).toBe(500);
    expect(lostOnReplace(handoff(null, 'STUDIO_DECLINED', 500))).toBe(0);
    expect(lostOnReplace(handoff(null, 'BRIEF_SENT', 500, 0, 'FAILED'))).toBe(0);
  });

  it('leaves nothing for the new studio when the season fee went to the old one', () => {
    const project = {
      productionFeeTokens: 900,
      seasonFees: [fee('s1', 400), fee('s2', 500)],
      studioHandoffs: [handoff('s1', 'IN_PROGRESS', 400), handoff('s2', 'BRIEF_SENT', 500)],
    };
    expect(swapPreview(project, 's2')).toEqual({ lostTokens: 500, availableTokens: 0 });
  });

  it('gives the new studio a top-up made after an earlier swap', () => {
    const project = {
      productionFeeTokens: 1300,
      seasonFees: [fee('s1', 400)],
      studioHandoffs: [handoff('s1', 'STUDIO_DECLINED', 400), handoff('s1', 'SUPERSEDED', 500, 500)],
    };
    expect(swapPreview(project, 's1')).toEqual({ lostTokens: 0, availableTokens: 400 });
  });

  it('works on the whole project when no season is picked', () => {
    const project = { productionFeeTokens: 1000, seasonFees: [], studioHandoffs: [handoff(null, 'DELIVERED', 600)] };
    expect(swapPreview(project, null)).toEqual({ lostTokens: 600, availableTokens: 400 });
  });
});
