'use client';

import { useState } from 'react';
import { Repeat, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { studioService } from '@/services/studioService';
import type { HandoffMaterial, StudioHandoff } from '@/types/production';
import { useResource } from '../../hooks/useResource';
import { DELIVERY_PROJECT, isIn } from '../../lib/capabilities';
import { saveBlob } from '../../lib/format';
import { Empty, ErrorNote, Facts, Loading, Panel } from '../shared/ui';
import { HandoffCard } from './HandoffCard';
import { ChangeStudioModal, HandOffModal } from './HandoffModals';
import { MilestoneModal } from './MilestoneModal';
import { useProject } from './ProjectContext';

/** The studio timeline of steps 3–4: what went to which Studio and when, every milestone and Submission (BR-58, BR-59). */
export function StudioTab() {
  const { project, caps, base } = useProject();
  const [mode, setMode] = useState<'handoff' | 'change' | null>(null);
  const [moving, setMoving] = useState<StudioHandoff | null>(null);
  const history = useResource(`handoffs:${project.id}:${project.updatedAt}`, () => studioService.listHandoffs(project.id));
  const delivering = isIn(project.status, DELIVERY_PROJECT);
  const canHandOff = caps.handoff && (project.status === 'ASSIGNED' || delivering);

  const downloadBrief = async (handoff: StudioHandoff) => {
    const blob = await studioService.downloadBrief(project.id, handoff.id);
    if (blob) saveBlob(blob, `brief-${project.title}.pdf`);
  };
  const downloadMaterial = async (handoff: StudioHandoff, material: HandoffMaterial) => {
    const blob = await studioService.downloadMaterial(project.id, handoff.id, material.id);
    if (blob) saveBlob(blob, material.fileName);
  };
  const refresh = async () => {
    await history.reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel
          title="Dòng thời gian Studio"
          description="Gửi brief PDF và file material cho Studio đối tác bên thứ 3 qua email, ghi nhận Studio, mùa được giao và ngày giao; sau đó Creator cập nhật từng mốc tiến độ của Studio và upload Submission Studio giao."
        >
          {history.error && <ErrorNote message={history.error} onRetry={history.reload} />}
          {history.loading && !history.data && <Loading />}
          {history.data?.length === 0 && <Empty>Chưa bàn giao cho Studio nào.</Empty>}
          <ol className="space-y-3">
            {history.data?.map((handoff) => (
              <HandoffCard
                key={handoff.id}
                handoff={handoff}
                movieId={project.id}
                base={base}
                onBrief={() => downloadBrief(handoff)}
                onMaterial={(material) => downloadMaterial(handoff, material)}
                onMilestone={caps.handoff && delivering ? () => setMoving(handoff) : undefined}
              />
            ))}
          </ol>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Studio của dự án">
          {project.studio ? (
            <Facts
              stacked
              items={[
                ['Studio', project.studio.name],
                ['Email', project.studio.email],
                ['Liên hệ', project.studio.contactName ?? '—'],
                ['Điện thoại', project.studio.phone ?? '—'],
              ]}
            />
          ) : (
            <Empty>Chưa chọn Studio.</Empty>
          )}
          <div className="mt-4 space-y-2">
            {canHandOff && (
              <Button size="sm" className="w-full" onClick={() => setMode('handoff')}>
                <Send className="w-3.5 h-3.5" aria-hidden="true" /> Bàn giao cho Studio
              </Button>
            )}
            {caps.handoff && delivering && (history.data?.length ?? 0) > 0 && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setMode('change')}>
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" /> Đổi Studio
              </Button>
            )}
            {caps.creator && project.status === 'DRAFT' && <p className="text-xs text-slate-500">Chờ Reviewer hoàn tất kế hoạch.</p>}
            {project.status === 'ASSIGNED' && !caps.handoff && <p className="text-xs text-slate-500">Chờ Content Creator bàn giao cho Studio.</p>}
          </div>
        </Panel>
      </div>

      {mode === 'handoff' && <HandOffModal onClose={() => setMode(null)} />}
      {mode === 'change' && <ChangeStudioModal onClose={() => setMode(null)} />}
      {moving && (
        <MilestoneModal
          handoff={moving}
          onClose={() => {
            setMoving(null);
            void refresh();
          }}
        />
      )}
    </div>
  );
}
