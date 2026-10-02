'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { productionService } from '@/services/productionService';
import type { MediaAsset } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { DELIVERY_PROJECT, SUBMITTABLE_EPISODE, isIn, projectCapabilities } from '../../lib/capabilities';
import { EPISODE_STATUS } from '../../lib/labels';
import { formatDay, formatDuration, formatNumber } from '../../lib/format';
import { baseFromPath, productionPaths } from '../../lib/routes';
import { ErrorNote, Facts, Loading, Panel, StatusPill } from '../shared/ui';
import { DeliverMediaPanel, deliverAsCreator } from './DeliverMediaPanel';
import { HlsPreview } from './HlsPreview';
import { MediaVersions } from './MediaVersions';
import { PublishPanel } from './PublishPanel';
import { ReviewPanel } from './ReviewPanel';

const POLL_MS = 5_000;
const IN_PROGRESS = ['PENDING', 'DOWNLOADING', 'TRANSCODING', 'VALIDATING'];

const inProgress = (versions: MediaAsset[] | null) => !!versions?.some((v) => IN_PROGRESS.includes(v.ingestStatus));

/** One episode end to end: deliveries, review sheet, label, compliance and release. */
export function EpisodePage() {
  const { projectId, episodeId } = useParams<{ projectId: string; episodeId: string }>();
  const base = baseFromPath(usePathname());
  const userId = useAppStore((s) => s.user?.id);
  const can = useCan();

  const project = useResource(`project:${projectId}`, () => productionService.getProject(projectId));
  const media = useResource(`media:${episodeId}`, () => productionService.listMedia(episodeId));
  const [picked, setPicked] = useState<string | null>(null);
  const { busy, run } = useAction();

  const episode = project.data?.seasons.flatMap((s) => s.episodes).find((e) => e.id === episodeId) ?? null;
  const versions = media.data;
  // The version under review: the one picked, else the approved one, else the newest.
  const selectedId = picked ?? episode?.approvedMediaAssetId ?? versions?.[0]?.id ?? null;
  const selected = versions?.find((v) => v.id === selectedId) ?? null;
  const sheet = useResource(selected && selected.ingestStatus === 'READY' ? `sheet:${selected.id}:${episode?.status}` : null, () =>
    productionService.getReviewSheet(selected!.id),
  );

  // Follow processing until every version is ready or failed; then the episode status moved too.
  const processing = inProgress(versions);
  const { reload: reloadMedia } = media;
  const { reload: reloadProject } = project;
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => {
      void reloadMedia();
      void reloadProject();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [processing, reloadMedia, reloadProject]);

  if ((project.loading && !project.data) || (media.loading && !media.data)) return <Loading label="Đang tải tập…" />;
  if (!project.data || !episode) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <ErrorNote message={project.error ?? media.error ?? 'Không tìm thấy tập này.'} onRetry={project.reload} />
      </main>
    );
  }

  const caps = projectCapabilities(project.data, userId, can);
  const delivering = isIn(project.data.status, DELIVERY_PROJECT);
  const canDeliver = caps.ingest && delivering && isIn(episode.status, SUBMITTABLE_EPISODE);
  const refreshAll = async () => {
    await Promise.all([project.reload(), media.reload(), sheet.reload()]);
  };
  const retry = async (id: string) => {
    if (await run(() => productionService.retryMedia(id), 'Đang xử lý lại')) await refreshAll();
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="space-y-2">
        <Link href={productionPaths.project(base, projectId, 'episodes')} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600">
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> {project.data.title}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tập {episode.episodeNumber}: {episode.title}
          </h1>
          <StatusPill {...EPISODE_STATUS[episode.status]} />
        </div>
      </div>

      {episode.revisionStartedAt && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Tập đã bị gỡ để sửa: người xem thấy thông báo bảo trì, người đã mua vẫn giữ quyền xem. Giao bản sửa rồi phát hành lại.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          {selected?.streamUrl && selected.ingestStatus === 'READY' && (
            <section aria-label="Xem bản dựng">
              <HlsPreview src={selected.streamUrl} />
            </section>
          )}
          {sheet.data && <ReviewPanel sheet={sheet.data} canAct={caps.review && delivering} onChanged={refreshAll} />}
          {selected && selected.ingestStatus !== 'READY' && (
            <Panel title={`Bản ${selected.version}`}>
              <p className="text-xs text-slate-500">
                {selected.ingestStatus === 'FAILED'
                  ? 'Bản này xử lý lỗi; Creator có thể xử lý lại hoặc giao bản mới.'
                  : 'Hệ thống đang xử lý bản này, trang tự cập nhật.'}
              </p>
            </Panel>
          )}
          <PublishPanel episode={episode} projectStatus={project.data.status} canAct={caps.publish} onChanged={refreshAll} />
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Panel title="Thông tin tập">
            <Facts
              stacked
              items={[
                ['Thời lượng mục tiêu', formatDuration(episode.targetDurationSeconds)],
                ['Thời hạn', formatDay(episode.milestoneDate)],
                ['Giá Coin', formatNumber(episode.coinPrice)],
                ['Studio', project.data.studioName ?? '—'],
              ]}
            />
            {episode.synopsis && <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{episode.synopsis}</p>}
          </Panel>

          {canDeliver && (
            <DeliverMediaPanel title="Giao thay studio" deliver={deliverAsCreator(episode.id)} onDelivered={refreshAll} />
          )}

          <Panel title="Các bản studio đã giao" description={processing ? 'Đang xử lý video…' : undefined}>
            <MediaVersions
              versions={versions ?? []}
              selectedId={selectedId}
              approvedId={episode.approvedMediaAssetId}
              onSelect={setPicked}
              onRetry={caps.ingest && delivering ? retry : undefined}
              busy={busy}
            />
          </Panel>
        </div>
      </div>
    </main>
  );
}
