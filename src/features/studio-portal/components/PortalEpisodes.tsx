'use client';

import { useState } from 'react';
import { MessageSquareWarning, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DeliverMediaPanel, type Delivery } from '@/features/production/components/episode/DeliverMediaPanel';
import { Empty, StatusPill } from '@/features/production/components/shared/ui';
import { EPISODE_STATUS, INGEST_STATUS } from '@/features/production/lib/labels';
import { formatDateTime, formatDay, formatDuration } from '@/features/production/lib/format';
import { studioPortalService } from '@/services/studioPortalService';
import type { EpisodeStatus } from '@/types/production';
import type { PortalEpisode, StudioPortalOverview } from '@/types/studio-portal';

/** The studio can deliver while it still owes the episode or the Reviewer is looking at it. */
const DELIVERABLE: EpisodeStatus[] = ['AWAITING_MEDIA', 'IN_REVIEW', 'CHANGES_REQUESTED'];

export function PortalEpisodes({
  token,
  overview,
  onChanged,
}: {
  token: string;
  overview: StudioPortalOverview;
  onChanged: () => Promise<void>;
}) {
  const [delivering, setDelivering] = useState<PortalEpisode | null>(null);

  const deliver = (episodeId: string) => (d: Delivery) =>
    d.method === 'UPLOAD'
      ? studioPortalService.uploadMedia(token, episodeId, d.file, d.meta)
      : studioPortalService.submitMediaLink(token, episodeId, { ...d.meta, sourceMethod: d.method, sourceUrl: d.url });

  return (
    <div className="space-y-4">
      {overview.seasons.map((season) => (
        <section key={season.seasonNumber} aria-label={`Mùa ${season.seasonNumber}`} className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Mùa {season.seasonNumber}
            {season.title && season.title !== `Mùa ${season.seasonNumber}` && <span className="font-normal text-slate-500"> — {season.title}</span>}
          </h2>
          {season.episodes.length === 0 && <Empty>Mùa này chưa có tập.</Empty>}
          {season.episodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              canDeliver={overview.canDeliver && DELIVERABLE.includes(ep.status)}
              onDeliver={() => setDelivering(ep)}
            />
          ))}
        </section>
      ))}

      <Modal
        open={!!delivering}
        onClose={() => setDelivering(null)}
        title={delivering ? `Giao tập ${delivering.episodeNumber}: ${delivering.title}` : ''}
        subtitle={delivering ? `Hạn giao ${formatDay(delivering.dueDate)} · thời lượng mục tiêu ${formatDuration(delivering.targetDurationSeconds)}` : undefined}
        maxWidth="max-w-2xl"
      >
        {delivering && (
          <DeliverMediaPanel
            declarant="studio"
            title="Bản dựng và cam kết AI"
            deliver={deliver(delivering.id)}
            onDelivered={async () => {
              setDelivering(null);
              await onChanged();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function EpisodeCard({ episode, canDeliver, onDeliver }: { episode: PortalEpisode; canDeliver: boolean; onDeliver: () => void }) {
  const latest = episode.latestDelivery;
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 text-xs space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">
            Tập {episode.episodeNumber}: {episode.title}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Hạn giao <span className="font-semibold text-slate-700 dark:text-slate-200">{formatDay(episode.dueDate)}</span> · thời lượng mục tiêu{' '}
            {formatDuration(episode.targetDurationSeconds)}
          </p>
        </div>
        <StatusPill {...EPISODE_STATUS[episode.status]} />
      </div>
      {episode.synopsis && <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{episode.synopsis}</p>}

      {latest && (
        <p className="text-slate-500 dark:text-slate-400">
          Bản mới nhất: v{latest.version} · {INGEST_STATUS[latest.ingestStatus].label}
          {latest.durationSeconds !== null && ` · ${formatDuration(latest.durationSeconds)}`} · {formatDateTime(latest.createdAt)}
        </p>
      )}
      {latest?.ingestStatus === 'FAILED' && latest.failureReason && <p className="text-rose-600">{latest.failureReason}</p>}

      {episode.changesRequested && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
          <MessageSquareWarning className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Yêu cầu sửa ({formatDateTime(episode.changesRequested.createdAt)})</p>
            <p className="whitespace-pre-line">{episode.changesRequested.comments}</p>
          </div>
        </div>
      )}

      {canDeliver && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onDeliver}>
            <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" /> {latest ? 'Giao bản mới' : 'Giao bản dựng'}
          </Button>
        </div>
      )}
    </article>
  );
}
