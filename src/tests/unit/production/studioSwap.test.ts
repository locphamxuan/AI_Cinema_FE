import { describe, expect, it } from 'vitest';
import { swapPreview } from '@/features/production/lib/studioSwap';

type Status = 'BRIEF_SENT' | 'STUDIO_ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'STUDIO_DECLINED' | 'SUPERSEDED';

const handoff = (seasonId: string | null, milestoneStatus: Status, offeredFeeVnd: number) => ({ seasonId, milestoneStatus, offeredFeeVnd });
const cost = (remainingVnd: number) => ({ budgetVnd: 0, committedVnd: 0, remainingVnd });

describe('studio swap preview (BR-59)', () => {
  it('gives the replaced fee back to the budget when the old studio keeps nothing', () => {
    const project = { cost: cost(10_000_000), studioHandoffs: [handoff('s1', 'IN_PROGRESS', 40_000_000), handoff('s2', 'BRIEF_SENT', 50_000_000)] };
    expect(swapPreview(project, 's2')).toEqual({ replacedFeeVnd: 50_000_000, maxOfferVnd: 60_000_000 });
  });

  it('takes off what the old studio keeps, never more than its fee', () => {
    const project = { cost: cost(10_000_000), studioHandoffs: [handoff('s1', 'DELIVERED', 40_000_000)] };
    expect(swapPreview(project, 's1', 15_000_000)).toEqual({ replacedFeeVnd: 40_000_000, maxOfferVnd: 35_000_000 });
    expect(swapPreview(project, 's1', 90_000_000).maxOfferVnd).toBe(10_000_000);
  });

  it('ignores hand-offs already replaced and other scopes', () => {
    const project = {
      cost: cost(5_000_000),
      studioHandoffs: [handoff(null, 'SUPERSEDED', 30_000_000), handoff(null, 'IN_PROGRESS', 20_000_000), handoff('s1', 'IN_PROGRESS', 9_000_000)],
    };
    expect(swapPreview(project, null)).toEqual({ replacedFeeVnd: 20_000_000, maxOfferVnd: 25_000_000 });
  });
});
