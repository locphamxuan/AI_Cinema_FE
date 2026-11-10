'use client';

import { contractService } from '@/services/contractService';
import { scriptService } from '@/services/scriptService';
import type { Contract } from '@/types/contract';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatVnd } from '@/lib/format';
import { ContractCard } from '../shared/ContractCard';
import { Button } from '@/components/ui/Button';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { useProject } from './ProjectContext';

/** Rounds still negotiated, or the signed one: a project then has its contract and needs no new template. */
const LIVE: Contract['status'][] = ['SENT', 'STUDIO_SIGNED', 'ADMIN_COUNTERED', 'SIGNED'];

/** The rounds of each studio the project negotiated with, in the order the studios were contracted. */
function byStudio(contracts: Contract[]): { studio: Contract['studio']; rounds: Contract[] }[] {
  const groups = new Map<string, { studio: Contract['studio']; rounds: Contract[] }>();
  for (const c of contracts) {
    const group = groups.get(c.studioId) ?? { studio: c.studio, rounds: [] };
    group.rounds.push(c);
    groups.set(c.studioId, group);
  }
  return [...groups.values()].map((g) => ({ ...g, rounds: [...g.rounds].sort((a, b) => a.round - b.round) }));
}

/**
 * MF-1 §3–4: when the Admin approves the Final Script the system sends the project's studio a template contract
 * without a cost; the studio (on Studio Web) fills it in and signs; the Admin signs to agree or proposes another
 * cost, until one round carries both signatures - which hands the project off to the studio automatically.
 */
export function ContractTab() {
  const { project, caps, reload } = useProject();
  const contracts = useResource(`contracts:${project.id}:${project.updatedAt}`, () => contractService.forProject(project.id));
  const groups = byStudio(contracts.data ?? []);
  const hasLive = (contracts.data ?? []).some((c) => LIVE.includes(c.status));

  const changed = async () => {
    await Promise.all([contracts.reload(), reload()]);
  };

  return (
    <div className="space-y-5">
      {contracts.error && <ErrorNote message={contracts.error} onRetry={contracts.reload} />}
      {contracts.loading && !contracts.data && <Loading />}
      {contracts.data && !hasLive && <ResendTemplate canSend={caps.contractManage} onSent={changed} />}
      {groups.map(({ studio, rounds }) => (
        <Panel
          key={studio.id}
          title={`Hợp đồng với Studio ${studio.name}`}
          description={`Studio điền giá và ký trên Studio Web; Admin ký để đồng ý hoặc đề xuất giá khác. Ngân sách còn lại: ${formatVnd(project.cost.remainingVnd)}.`}
        >
          <ul className="space-y-3">
            {rounds.map((c) => (
              <ContractCard key={c.id} contract={c} canDecide={caps.contractManage} onChanged={changed} />
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}

/**
 * No live contract yet: normally the template goes out when the Admin approves the Final Script. The Admin may
 * send it again (e.g. after the studio changed) while the project is ASSIGNED with a studio and a Final Script.
 */
function ResendTemplate({ canSend, onSent }: { canSend: boolean; onSent: () => Promise<void> }) {
  const { project } = useProject();
  const script = useResource(canSend ? `script:${project.id}` : null, () => scriptService.get(project.id));
  const { busy, run } = useAction();
  const ready = project.status === 'ASSIGNED' && !!project.studio && script.data?.status === 'FINAL';

  const send = async () => {
    if (await run(() => contractService.create(project.id), 'Đã gửi hợp đồng mẫu cho Studio')) await onSent();
  };

  return (
    <Panel title="Hợp đồng sản xuất">
      <Empty>Chưa có hợp đồng. Hệ thống tự gửi hợp đồng mẫu cho Studio khi Admin duyệt Kịch bản Final (tab Kịch bản).</Empty>
      {canSend && ready && (
        <div className="mt-3">
          <Button type="button" onClick={send} disabled={busy}>
            Gửi lại hợp đồng mẫu cho Studio {project.studio?.name}
          </Button>
        </div>
      )}
    </Panel>
  );
}
