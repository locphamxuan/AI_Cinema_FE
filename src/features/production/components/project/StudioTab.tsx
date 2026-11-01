'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TokenRequestForm } from '@/features/token-request/TokenRequestForm';
import { TokenRequestList } from '@/features/token-request/TokenRequestList';
import { studioService } from '@/services/studioService';
import type { HandoffMaterial, StudioHandoff } from '@/types/production';
import { useResource } from '@/hooks/useResource';
import { DELIVERY_PROJECT, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { downloadFile } from '../../lib/download';
import { Pager, pageOf } from '@/components/data/Pager';
import { Empty, ErrorNote, Facts, Loading, Panel } from '@/components/data/ui';
import { HandoffCard } from './HandoffCard';
import { ChangeStudioModal, HandOffModal } from './HandoffModals';
import { MilestoneModal } from './MilestoneModal';
import { useProject } from './ProjectContext';
import { episodeCountsBySeason } from '@/lib/seasonLabel';

const PAGE_SIZE = 5;

/** Sub-tabs of the Studio timeline: each hand-off sits under its milestone, a failed brief email under "Lỗi". */
const FILTERS: { key: string; label: string; match: (h: StudioHandoff) => boolean }[] = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 'sent', label: 'Đã gửi brief', match: (h) => h.milestoneStatus === 'BRIEF_SENT' },
  { key: 'accepted', label: 'Studio đã nhận', match: (h) => h.milestoneStatus === 'STUDIO_ACCEPTED' },
  { key: 'progress', label: 'Studio đang làm', match: (h) => h.milestoneStatus === 'IN_PROGRESS' },
  { key: 'delivered', label: 'Studio đã giao', match: (h) => h.milestoneStatus === 'DELIVERED' },
  { key: 'declined', label: 'Studio từ chối', match: (h) => h.milestoneStatus === 'STUDIO_DECLINED' },
  { key: 'failed', label: 'Lỗi gửi email', match: (h) => h.emailMessage?.status === 'FAILED' },
  { key: 'superseded', label: 'Đã đổi Studio', match: (h) => h.milestoneStatus === 'SUPERSEDED' },
];

/** The studio timeline of steps 3–4: what went to which Studio and when, every milestone and Submission (BR-58, BR-59). */
export function StudioTab() {
  const { project, caps, base } = useProject();
  const episodeCounts = episodeCountsBySeason(project.seasons);
  const [mode, setMode] = useState<'handoff' | 'change' | null>(null);
  const [moving, setMoving] = useState<StudioHandoff | null>(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [requestsVersion, setRequestsVersion] = useState(0);
  const history = useResource(`handoffs:${project.id}:${project.updatedAt}`, () => studioService.listHandoffs(project.id));
  const delivering = isIn(project.status, DELIVERY_PROJECT);
  const canHandOff = caps.handoff && (project.status === 'ASSIGNED' || delivering);
  const canAskTokens = caps.askTokens && isIn(project.status, [...OPEN_PROJECT, 'UNDER_REVISION']);
  const all = history.data ?? [];
  const declined = all.some((h) => h.milestoneStatus === 'STUDIO_DECLINED');
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
          description="Gửi brief PDF và tài liệu cho Studio đối tác qua email. Sau đó Creator cập nhật tiến độ của Studio và nộp bản phim Studio giao."
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
                onBrief={() => void downloadBrief(handoff)}
                onMaterial={(material) => void downloadMaterial(handoff, material)}
                onMilestone={caps.handoff && delivering ? () => setMoving(handoff) : undefined}
              />
            ))}
          </ol>
          <Pager page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
        </Panel>

        <Panel title="Yêu cầu thêm Token" description="Creator gửi Reviewer khi Studio không chấp nhận mức Token; Admin theo dõi.">
          <TokenRequestList movieId={project.id} canAnswer={caps.feeAllocate} refreshKey={requestsVersion} />
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
            {canHandOff && (
              <Button size="sm" className="w-full" onClick={() => setMode('handoff')}>
                Bàn giao cho Studio
              </Button>
            )}
            {caps.handoff && delivering && all.length > 0 && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setMode('change')}>
                Đổi Studio
              </Button>
            )}
            {caps.creator && project.status === 'DRAFT' && <p className="text-xs text-slate-500">Chờ Reviewer hoàn tất kế hoạch.</p>}
            {project.status === 'ASSIGNED' && !caps.handoff && <p className="text-xs text-slate-500">Chờ Creator chính bàn giao cho Studio.</p>}
            {caps.creator && !caps.lead && (
              <p className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-3 text-xs text-sky-800 dark:text-sky-300">
                Bạn là Creator phụ: Creator chính {project.creator?.fullName ?? ''} bàn giao, đổi Studio, cập nhật mốc và xin thêm Token. Studio CC bạn
                khi gửi phim; tải tập của bạn rồi upload Submission ở trang tập để gửi lên Creator chính.
              </p>
            )}
          </div>
        </Panel>
        {canAskTokens && (
          <>
            {declined && (
              <p className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                Studio đã từ chối. Nếu lý do là mức Token, hãy xin thêm Token từ Reviewer bên dưới.
              </p>
            )}
            <TokenRequestForm project={project} onSent={() => setRequestsVersion((v) => v + 1)} />
          </>
        )}
      </div>

      {mode === 'handoff' && <HandOffModal onClose={() => setMode(null)} />}
      {mode === 'change' && (
        <ChangeStudioModal
          onClose={() => setMode(null)}
          onAskTokens={() => {
            setMode(null);
            document.getElementById('xin-them-token')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      )}
      {moving && (
        <MilestoneModal
          handoff={moving}
          onClose={() => {
            setMoving(null);
            void history.reload();
          }}
        />
      )}
    </div>
  );
}
