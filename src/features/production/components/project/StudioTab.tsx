'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { studioService } from '@/services/studioService';
import type { HandoffMaterial, StudioHandoff } from '@/types/production';
import { useResource } from '@/hooks/useResource';
import { DELIVERY_PROJECT, isIn } from '../../lib/capabilities';
import { downloadFile } from '../../lib/download';
import { Pager, pageOf } from '@/components/data/Pager';
import { Empty, ErrorNote, Facts, Loading, Panel } from '@/components/data/ui';
import { HandoffCard } from './HandoffCard';
import { ChangeStudioModal } from './HandoffModals';
import { useProject } from './ProjectContext';
import { episodeCountsBySeason } from '@/lib/seasonLabel';

const PAGE_SIZE = 5;

/**
 * Sub-tabs of the Studio timeline: each hand-off sits under its milestone, a failed brief email under "Lỗi". The system moves
 * the milestones (contract signed, film delivered, changes requested); older hand-offs may still read accepted or declined.
 */
const FILTERS: { key: string; label: string; match: (h: StudioHandoff) => boolean }[] = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 'sent', label: 'Đã gửi brief', match: (h) => h.milestoneStatus === 'BRIEF_SENT' },
  { key: 'progress', label: 'Studio đang làm', match: (h) => h.milestoneStatus === 'IN_PROGRESS' },
  { key: 'delivered', label: 'Studio đã giao', match: (h) => h.milestoneStatus === 'DELIVERED' },
  { key: 'failed', label: 'Lỗi gửi email', match: (h) => h.emailMessage?.status === 'FAILED' },
  { key: 'superseded', label: 'Đã đổi Studio', match: (h) => h.milestoneStatus === 'SUPERSEDED' },
];

/**
 * The studio timeline (BR-58, BR-59): the hand-off the signed contract opened, every milestone and Submission, and
 * studio changes, read-only. Since MF-1 07/11/2026 nobody hands off or moves a milestone by hand: signing the contract
 * opens the hand-off, the studio's delivery on Studio Web marks it delivered, a Reviewer's change request reopens it.
 */
export function StudioTab() {
  const { project, caps, base } = useProject();
  const episodeCounts = episodeCountsBySeason(project.seasons);
  const [changing, setChanging] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const history = useResource(`handoffs:${project.id}:${project.updatedAt}`, () => studioService.listHandoffs(project.id));
  const delivering = isIn(project.status, DELIVERY_PROJECT);
  const all = history.data ?? [];
  const matching = all.filter(FILTERS.find((f) => f.key === filter)!.match);
  const { rows, totalPages } = pageOf(matching, page, PAGE_SIZE);

  const downloadBrief = (handoff: StudioHandoff) =>
    downloadFile(() => studioService.downloadBrief(project.id, handoff.id), `brief-${project.title}.pdf`);
  const downloadMaterial = (handoff: StudioHandoff, material: HandoffMaterial) =>
    downloadFile(() => studioService.downloadMaterial(project.id, handoff.id, material.id), material.fileName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel
          title="Dòng thời gian Studio"
          description="Hợp đồng ký đủ hai bên thì hệ thống tự bàn giao cho Studio (brief PDF và tài liệu). Studio nộp phim từng tập trên Studio Web để Reviewer duyệt."
        >
          <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1.5 mb-4">
            {FILTERS.map((f) => {
              const count = all.filter(f.match).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => { setFilter(f.key); setPage(1); }}
                  className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer ${
                    filter === f.key ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
          {history.error && <ErrorNote message={history.error} onRetry={history.reload} />}
          {history.loading && !history.data && <Loading />}
          {history.data && matching.length === 0 && <Empty>{all.length ? 'Không có bàn giao nào ở mục này.' : 'Chưa bàn giao cho Studio nào.'}</Empty>}
          <ol className="space-y-3">
            {rows.map((handoff) => (
              <HandoffCard
                key={handoff.id}
                handoff={handoff}
                movieId={project.id}
                episodeCount={handoff.seasonId ? episodeCounts.get(handoff.seasonId) : undefined}
                base={base}
                canDecide={caps.contractManage}
                onBrief={() => void downloadBrief(handoff)}
                onMaterial={(material) => void downloadMaterial(handoff, material)}
              />
            ))}
          </ol>
          <Pager page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
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
                ['Liên hệ', project.studio.contactName ?? '-'],
                ['Điện thoại', project.studio.phone ?? '-'],
              ]}
            />
          ) : (
            <Empty>Chưa chọn Studio.</Empty>
          )}
          <div className="mt-4 space-y-2">
            {caps.contractManage && delivering && all.length > 0 && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setChanging(true)}>
                Đổi Studio
              </Button>
            )}
            {project.status === 'DRAFT' && <p className="text-xs text-slate-500">Chờ Admin giao Creator chính.</p>}
            {project.status === 'ASSIGNED' && (
              <p className="text-xs text-slate-500">Bàn giao tự động khi hợp đồng với Studio có đủ chữ ký Admin và Studio (tab Hợp đồng).</p>
            )}
            {caps.creator && !caps.lead && (
              <p className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-3 text-xs text-sky-800 dark:text-sky-300">
                Bạn là Creator phụ của dự án. Studio nộp phim từng tập trên Studio Web, Reviewer duyệt; các mốc bàn giao do hệ thống tự
                cập nhật. Bạn theo dõi các tập được giao và trao đổi với Creator chính {project.creator?.fullName ?? ''} ở mục Trao đổi về tập.
              </p>
            )}
          </div>
        </Panel>
      </div>

      {changing && <ChangeStudioModal onClose={() => setChanging(false)} />}
    </div>
  );
}
