'use client';

import { useEffect, useState } from 'react';
import { episodeAccessService } from '@/services/episodeAccessService';
import type { AccessDecision, MembershipPlan } from '@/types/episodeAccess';

export interface AccessState {
  decision: AccessDecision | null;
  /** The paid monthly plan the decision's `monthlyPlanCoinPrice` refers to, when one is on sale. */
  monthlyPlan: MembershipPlan | null;
  loading: boolean;
  error: string | null;
}

const IDLE: AccessState = { decision: null, monthlyPlan: null, loading: false, error: null };

/** Cheapest paid monthly plan on sale - the same plan the BE quotes in the access decision. */
function pickMonthlyPlan(plans: MembershipPlan[]): MembershipPlan | null {
  const paid = plans.filter((p) => !p.isFree && p.isActive && p.period === 'MONTHLY' && p.priceCoins !== null);
  return paid.sort((a, b) => (a.priceCoins ?? 0) - (b.priceCoins ?? 0))[0] ?? null;
}

/** MF-2 steps 6–7: asks the BE whether the caller may watch the episode and what is left to do. */
export function useAccessDecision(episodeId: string | null, open: boolean): AccessState {
  const [state, setState] = useState<{ key: string | null; value: AccessState }>({ key: null, value: IDLE });
  const key = open && episodeId ? episodeId : null;

  useEffect(() => {
    if (!key) return;
    let alive = true;
    Promise.all([episodeAccessService.checkAccess(key), episodeAccessService.getPlans()])
      .then(([decisionRes, plansRes]) => {
        if (!alive) return;
        setState({
          key,
          value: {
            decision: decisionRes.success ? decisionRes.data : null,
            monthlyPlan: plansRes.success && Array.isArray(plansRes.data) ? pickMonthlyPlan(plansRes.data) : null,
            loading: false,
            error: decisionRes.success ? null : decisionRes.message || 'Không thể kiểm tra quyền xem tập phim.',
          },
        });
      })
      .catch(() => {
        if (alive) setState({ key, value: { ...IDLE, error: 'Không thể kiểm tra quyền xem tập phim.' } });
      });
    return () => {
      alive = false;
    };
  }, [key]);

  if (!key) return IDLE;
  // Until the answer for this episode arrives, an earlier episode's answer must not show.
  return state.key === key ? state.value : { ...IDLE, loading: true };
}
