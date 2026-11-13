'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clapperboard } from 'lucide-react';
import { ErrorNote, Loading } from '@/components/data/ui';
import { projectCapabilities } from '@/features/production/lib/capabilities';
import { useCan } from '@/hooks/useCan';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { productionService } from '@/services/productionService';
import { scriptService } from '@/services/scriptService';
import { useAppStore } from '@/store/useAppStore';
import { toQueueItems, type QueueItem } from '../reviewQueue';
import { ReviewerAuditCanvas } from './ReviewerAuditCanvas';
import { ReviewerFeedbackPanel } from './ReviewerFeedbackPanel';

/** The film to open: the one in the URL, else the first one waiting for the Reviewer. */
function pickEpisode(queue: QueueItem[], projectId: string | null, episodeId: string | null): { projectId: string; episodeId: string } | null {
  if (projectId && episodeId) return { projectId, episodeId };
  const first = queue.find((item) => item.stage === 'MASTER_AUDIT' && item.episodeId);
  return first?.episodeId ? { projectId: first.projectId, episodeId: first.episodeId } : null;
}

const hrefOf = (item: QueueItem | undefined) => item?.href ?? null;

function AuditDesk({ projectId, episodeId, queue }: { projectId: string; episodeId: string; queue: QueueItem[] }) {
  const userId = useAppStore((s) => s.user?.id);
  const can = useCan();
  const project = useResource(`project:${projectId}`, () => productionService.getProject(projectId));
  const media = useResource(`media:${episodeId}`, () => productionService.listMedia(episodeId));
  const script = useResource(`script:${projectId}`, () => scriptService.get(projectId));
  const [picked, setPicked] = useState<string | null>(null);

  const episode = project.data?.seasons.flatMap((s) => s.episodes).find((e) => e.id === episodeId) ?? null;
  const versions = media.data ?? [];
  const selected = versions.find((v) => v.id === (picked ?? episode?.approvedMediaAssetId)) ?? versions[0] ?? null;
  const sheet = useResource(selected?.ingestStatus === 'READY' ? `sheet:${selected.id}:${episode?.status}` : null, () => productionService.getReviewSheet(selected!.id));

  if ((project.loading && !project.data) || (media.loading && !media.data)) return <Loading label="Đang tải bản phim…" />;
  if (!project.data || !episode) return <ErrorNote message={project.error ?? media.error ?? 'Không tìm thấy tập này.'} onRetry={project.reload} />;

  const caps = projectCapabilities(project.data, userId, can);
  const audit = queue.filter((item) => item.stage === 'MASTER_AUDIT' && item.episodeId);
  const position = audit.findIndex((item) => item.episodeId === episodeId);
  const refresh = async () => {
    await Promise.all([project.reload(), media.reload(), sheet.reload()]);
  };

  return (
    <>
      <ReviewerAuditCanvas
        project={project.data}
        episode={episode}
        versions={versions}
        selected={selected}
        script={script.data}
        onPick={setPicked}
        previousHref={position > 0 ? hrefOf(audit[position - 1]) : null}
        nextHref={position >= 0 ? hrefOf(audit[position + 1]) : null}
      />
      <ReviewerFeedbackPanel sheet={sheet.data} episode={episode} projectStatus={project.data.status} caps={caps} onChanged={refresh} />
    </>
  );
}

/** /reviewer: the film chosen from the queue (or the first one waiting) next to its review sheet. */
export function ReviewerAuditWorkspace() {
  const params = useSearchParams();
  const pipelines = useResource('reviewer-pipelines', () => loadPipelines());
  const queue = useMemo(() => toQueueItems(pipelines.data ?? []), [pipelines.data]);
  const target = pickEpisode(queue, params.get('project'), params.get('episode'));

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F9FAFB] dark:bg-[#090B10] text-slate-900 dark:text-slate-100">
      {pipelines.loading && !pipelines.data && !target && <Loading label="Đang tìm phim cần thẩm định…" />}
      {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
      {target && <AuditDesk key={target.episodeId} projectId={target.projectId} episodeId={target.episodeId} queue={queue} />}
      {pipelines.data && !target && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
          <Clapperboard className="w-12 h-12 text-slate-400" aria-hidden="true" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Chưa có bản phim nào chờ thẩm định</h1>
          <Link href="/reviewer/projects" className="px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold transition-all">
            Xem hàng đợi dự án
          </Link>
        </div>
      )}
    </div>
  );
}
