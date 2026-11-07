'use client';

import { contractService } from '@/services/contractService';
import type { Contract } from '@/types/contract';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { ContractCard } from '../shared/ContractCard';
import { Button } from '@/components/ui/Button';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

/**
 * MF-1 contract negotiation: the system sends a studio a template contract (no cost); the studio fills it in
 * and signs; Admin signs to agree or counter-proposes a cost, until one round carries both signatures. A
 * hand-off starts production only once it has one.
 */
export function ContractTab() {
  const { project, caps } = useProject();
  const contracts = useResource(`contracts:${project.id}:${project.updatedAt}`, () => contractService.forProject(project.id));
  const live = project.studioHandoffs.filter((h) => h.milestoneStatus !== 'SUPERSEDED');
  const byHandoff = new Map<string, Contract[]>();
  for (const c of contracts.data ?? []) byHandoff.set(c.handoffId, [...(byHandoff.get(c.handoffId) ?? []), c]);

  return (
    <div className="space-y-5">
      {contracts.error && <ErrorNote message={contracts.error} onRetry={contracts.reload} />}
      {contracts.loading && !contracts.data && <Loading />}
      {contracts.data && live.length === 0 && <Empty>Dự án chưa bàn giao Studio nào.</Empty>}
      {live.map((handoff) => {
        const rounds = (byHandoff.get(handoff.id) ?? []).sort((a, b) => a.round - b.round);
        return (
          <Panel
            key={handoff.id}
            title={`Hợp đồng với studio ${handoff.studio.name}`}
            description="Hệ thống gửi hợp đồng mẫu không có giá; Studio điền giá và ký; Admin đồng ý hoặc đề xuất giá khác cho tới khi cả hai bên ký."
          >
            {rounds.length === 0 ? (
              <SendTemplate handoffId={handoff.id} canSend={caps.contractManage} onSent={contracts.reload} />
            ) : (
              <ul className="space-y-3">
                {rounds.map((c) => (
                  <ContractCard key={c.id} contract={c} canDecide={caps.contractManage} onChanged={contracts.reload} />
                ))}
              </ul>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

function SendTemplate({ handoffId, canSend, onSent }: { handoffId: string; canSend: boolean; onSent: () => Promise<void> }) {
  const { project } = useProject();
  const { busy, run } = useAction();
  const send = async () => {
    if (await run(() => contractService.create(project.id, handoffId), 'Đã gửi hợp đồng mẫu cho studio')) await onSent();
  };
  if (!canSend) return <Empty>Chưa có hợp đồng; Admin sẽ gửi hợp đồng mẫu cho studio.</Empty>;
  return (
    <Button type="button" onClick={send} disabled={busy}>
      Gửi hợp đồng mẫu cho studio
    </Button>
  );
}
