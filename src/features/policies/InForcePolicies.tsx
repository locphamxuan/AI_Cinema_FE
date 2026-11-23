'use client';

import { Empty, ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { policyService } from '@/services/policyService';
import { POLICY_TYPE_KEYS, POLICY_TYPES } from './policyLabels';
import { PolicyText } from './PolicyText';

/**
 * The policies in force right now (GET /policies/in-force), grouped by type, each with what the Reviewer checks
 * against it. Shown next to the compliance check and on the Reviewer's "Chính sách" page.
 */
export function InForcePolicies() {
  const list = useResource('policies:in-force', () => policyService.inForce());

  if (list.error) return <ErrorNote message={list.error} onRetry={list.reload} />;
  if (!list.data) return <Loading />;
  if (list.data.length === 0) return <Empty>Chưa có chính sách nào đang áp dụng. Hãy báo Admin bật chính sách.</Empty>;

  return (
    <div className="space-y-5">
      {POLICY_TYPE_KEYS.map((type) => {
        const policies = list.data!.filter((p) => p.type === type);
        return (
          <section key={type} aria-label={POLICY_TYPES[type].label} className="space-y-2">
            <div>
              <h3 className="text-sm font-semibold">{POLICY_TYPES[type].label}</h3>
              <p className="text-xs text-muted-foreground">{POLICY_TYPES[type].usedFor}</p>
            </div>
            {policies.length === 0 && <p className="text-xs text-amber-600">Chưa có chính sách loại này đang áp dụng.</p>}
            {policies.map((p) => (
              <details key={p.id} open className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {p.name}
                  {p.documentReference && <span className="font-normal text-muted-foreground"> · {p.documentReference}</span>}
                </summary>
                <PolicyText text={p.content} className="mt-2 text-muted-foreground" />
              </details>
            ))}
          </section>
        );
      })}
    </div>
  );
}
